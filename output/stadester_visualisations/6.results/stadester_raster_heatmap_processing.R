# -----------------------------------------------------------------------------
# Load Necessary Libraries
# -----------------------------------------------------------------------------
library(terra)
library(png)
library(ggplot2)
library(tidyterra)
library(sf)
library(rnaturalearth)
library(gridExtra)

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
# Set the path to the directory containing your raster images
raster_dir <- "./6.results/stadester_rasters/"

# Define the Coordinate Reference Systems (CRS)
# Input CRS is WGS84 Equirectangular
wgs84_crs <- "EPSG:4326"
# Target CRS is Equal Earth
equal_earth_crs <- "+proj=eqearth +datum=WGS84 +ellps=WGS84"

# -----------------------------------------------------------------------------
# Helper Function to Decode Pixel Values
# -----------------------------------------------------------------------------
# This function reads a PNG file and decodes its RGBA pixels into a single
# numeric value based on the specified bitwise formula.
# The formula `((r << 24) | (g << 16) | (b << 8) | a)` is emulated using
# arithmetic operations to avoid potential signed integer issues in R.
decode_rgba_to_numeric <- function(png_path) {
  # Read the PNG file into a 4-layer array (Height x Width x RGBA)
  # The values are in the range [0, 1]
  img <- readPNG(png_path)
  
  # Scale RGBA values from [0, 1] to integers [0, 255]
  r <- floor(img[,,1] * 255)
  g <- floor(img[,,2] * 255)
  b <- floor(img[,,3] * 255)
  a <- floor(img[,,4] * 255)
  
  # Use arithmetic to create a unique numeric value for each pixel.
  # This avoids bitwise operations on large numbers which can be tricky in R.
  # Using as.numeric to handle potentially large integer values.
  decoded_matrix <- as.numeric(r) * 2^24 +
    as.numeric(g) * 2^16 +
    as.numeric(b) * 2^8  +
    as.numeric(a)
  
  # Reshape the vector back into a matrix with the original dimensions
  dim(decoded_matrix) <- dim(r)
  
  return(decoded_matrix)
}

# -----------------------------------------------------------------------------
# Data Preparation
# -----------------------------------------------------------------------------
# Get a list of all PNG files in the directory
# The pattern ensures we only get the files we're interested in.
file_list <- list.files(
  path = raster_dir,
  pattern = "^stadester_\\d{4}\\.png$",
  full.names = TRUE
)

# Sort the file list to ensure chronological order
file_list <- sort(file_list)

# We only want to display the first 120 images as specified
files_to_process <- head(file_list, 120)

# Fetch and reproject the base coastlines for the map
# Using rnaturalearth to get a simple features (sf) object for coastlines.
print("Fetching and reprojecting coastlines...")
coastlines_sf <- ne_coastline(scale = "medium", returnclass = "sf")
coastlines_equal_earth <- st_transform(coastlines_sf, crs = equal_earth_crs)
print("Coastlines ready.")

# -----------------------------------------------------------------------------
# Main Processing Loop: Read, Decode, Reproject, and Plot Rasters
# -----------------------------------------------------------------------------
# This loop will iterate through each file, process it, and create a ggplot map.
# The maps will be stored in a list for later arrangement into grids.
plot_list <- list()

print(paste("Starting to process", length(files_to_process), "raster images..."))

for (file_path in files_to_process) {
  year <- sub(".*_(\\d{4})\\.png$", "\\1", file_path)
  print(paste("Processing:", basename(file_path)))
  
  # 1. Decode the PNG to a numeric matrix
  numeric_matrix <- decode_rgba_to_numeric(file_path)
  
  # 2. Create a SpatRaster object from the matrix
  # The input raster is a 4320x2160 WGS84 Equirectangular raster
  wgs84_raster <- rast(numeric_matrix, crs = wgs84_crs)
  
  # Set the correct global extent for a WGS84 raster
  ext(wgs84_raster) <- c(-180, 180, -90, 90)
  
  # 3. Reproject the raster to the Equal Earth projection
  # The 'bilinear' method is a good default for continuous data.
  equal_earth_raster <- project(wgs84_raster, equal_earth_crs, method = "bilinear")
  
  # Replace 0s with NA so they don't appear on the logarithmic scale
  # and can be made transparent.
  equal_earth_raster[equal_earth_raster == 0] <- NA
  
  # 4. Create the heatmap plot using ggplot2 and tidyterra
  p <- ggplot() +
    # Use tidyterra's geom_spatraster for direct plotting of SpatRaster objects
    geom_spatraster(data = equal_earth_raster, aes(fill = lyr.1)) +
    
    # Add the reprojected coastlines
    geom_sf(data = coastlines_equal_earth, color = "black", size = 0.2) +
    
    # Apply a logarithmic color scale for the heatmap effect
    scale_fill_viridis_c(
      option = "plasma",
      trans = "log10",
      na.value = "transparent",
      name = "Value (log scale)"
    ) +
    
    # Add titles and theme adjustments
    labs(
      title = paste("Year:", year),
      subtitle = "Equal Earth Projection",
      x = NULL,
      y = NULL
    ) +
    theme_minimal() +
    theme(
      panel.background = element_rect(fill = "gray90", color = NA),
      panel.grid = element_blank(),
      axis.text = element_blank(),
      axis.ticks = element_blank(),
      plot.title = element_text(hjust = 0.5) # Center title
    )
  
  # Add the plot to our list of plots
  plot_list[[file_path]] <- p
}

print("All raster images have been processed and plotted.")

# -----------------------------------------------------------------------------
# Arrange Plots into 3x4 Grids
# -----------------------------------------------------------------------------
# The task is to display the plots in 3x4 grids. Since there are 120 plots,
# this will result in 10 pages/grids of 12 plots each.

# Define grid dimensions
plots_per_grid <- 12
num_cols <- 4
num_rows <- 3

# Calculate the total number of grids needed
num_grids <- ceiling(length(plot_list) / plots_per_grid)

print(paste("Arranging", length(plot_list), "plots into", num_grids, "grids of 3x4..."))

for (i in 1:num_grids) {
  # Determine the start and end index for the plots on the current grid
  start_index <- (i - 1) * plots_per_grid + 1
  end_index <- min(i * plots_per_grid, length(plot_list))
  
  # Get the subset of plots for the current grid
  grid_plots <- plot_list[start_index:end_index]
  
  # Arrange the plots into a grid
  # The 'do.call' method is used to pass the list of plots to grid.arrange
  final_grid <- do.call("grid.arrange", c(grid_plots, ncol = num_cols, nrow = num_rows))
  
  # You can either print the grid to the screen or save it to a file
  # To print to the plot viewer:
  print(paste("Displaying Grid", i))
  plot(final_grid)
  
  # --- Optional: Save each grid to a file ---
  # output_filename <- paste0("output_grid_", i, ".png")
  # ggsave(
  #   output_filename,
  #   plot = final_grid,
  #   width = 16,
  #   height = 12,
  #   units = "in",
  #   dpi = 150
  # )
  # print(paste("Saved", output_filename))
}

print("Script finished.")