# -----------------------------------------------------------------------------
# Load Necessary Libraries
# -----------------------------------------------------------------------------
library(terra)
library(png)
library(ggplot2)
library(tidyterra)
library(sf) # Used for st_graticule()
library(rnaturalearth)
library(gridExtra)
library(scales) # *** CHANGE: Load the scales library for SI labels ***

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
# Set the path to the directory containing your raster images
raster_dir <- "./6.results/stadester_rasters/"

# Define the Coordinate Reference Systems (CRS)
wgs84_crs <- "EPSG:4326"
equal_earth_crs <- "+proj=eqearth +datum=WGS84"

# -----------------------------------------------------------------------------
# Helper Function to Decode Pixel Values
# -----------------------------------------------------------------------------
decode_rgba_to_numeric <- function(png_path) {
  img <- readPNG(png_path)
  r <- floor(img[,,1] * 255)
  g <- floor(img[,,2] * 255)
  b <- floor(img[,,3] * 255)
  a <- floor(img[,,4] * 255)
  
  decoded_matrix <- as.numeric(r) * 2^24 +
    as.numeric(g) * 2^16 +
    as.numeric(b) * 2^8  +
    as.numeric(a)
  
  dim(decoded_matrix) <- dim(r)
  return(decoded_matrix)
}

# -----------------------------------------------------------------------------
# Data Preparation
# -----------------------------------------------------------------------------
# Find files matching one or more digits
file_list <- list.files(
  path = raster_dir,
  pattern = "^stadester_\\d+\\.png$",
  full.names = TRUE
)

# Perform a "natural sort" to ensure correct numerical order
numeric_parts <- as.numeric(gsub("^stadester_|.png$", "", basename(file_list)))
file_list <- file_list[order(numeric_parts)]

# Select all images EXCEPT the last one
files_to_process <- head(file_list, -1)

# Ensure we are processing at most 120 files
if (length(files_to_process) > 120) {
  files_to_process <- files_to_process[1:120]
}

# --- Prepare map layers that will be used for every plot ---
print("Fetching and reprojecting map layers...")

# Fetch LAND polygons for the black background
land_sf <- ne_countries(scale = "medium", returnclass = "sf")
land_equal_earth <- st_transform(land_sf, crs = equal_earth_crs)

# Fetch coastlines for detail
coastlines_sf <- ne_coastline(scale = "medium", returnclass = "sf")
coastlines_equal_earth <- st_transform(coastlines_sf, crs = equal_earth_crs)

# Create a proper graticule layer for the grid lines.
graticules_sf <- sf::st_graticule(lat = seq(-80, 80, 20), lon = seq(-180, 180, 30))
graticules_equal_earth <- st_transform(graticules_sf, crs = equal_earth_crs)

print("Map layers ready.")

# -----------------------------------------------------------------------------
# Main Processing Loop
# -----------------------------------------------------------------------------
plot_list <- list()

print(paste("Starting to process", length(files_to_process), "raster images..."))

for (file_path in files_to_process) {
  year <- gsub("^stadester_|.png$", "", basename(file_path))
  print(paste("Processing:", basename(file_path)))
  
  # 1. Decode PNG and create a SpatRaster object
  numeric_matrix <- decode_rgba_to_numeric(file_path)
  wgs84_raster <- rast(numeric_matrix, crs = wgs84_crs, ext = c(-180, 180, -90, 90))
  
  # 2. Reproject the raster
  equal_earth_raster <- project(wgs84_raster, equal_earth_crs, method = "bilinear")
  
  # 3. Set all zero values to NA to make them transparent
  data_raster <- classify(equal_earth_raster, cbind(0, 0, NA), right = TRUE)
  
  # 4. Create the plot with the correct layers
  p <- ggplot() +
    # Layer 1: The graticules, drawn first to be in the background.
    geom_sf(data = graticules_equal_earth, color = "gray50", linetype = "solid", size = 0.25) +
    
    # Layer 2: Black landmass background
    geom_sf(data = land_equal_earth, fill = "black", color = NA) +
    
    # Layer 3: Logarithmic heatmap data
    geom_spatraster(data = data_raster, aes(fill = lyr.1)) +
    
    # Layer 4: Coastlines for detail, drawn on top of the heatmap
    geom_sf(data = coastlines_equal_earth, color = "gray20", size = 0.2) +
    
    # *** CHANGE: Define the color scale with SI unit labels ***
    scale_fill_viridis_c(
      option = "plasma",
      trans = "log10",
      na.value = "transparent",
      name = "Population",
      labels = label_number(scale_cut = cut_si(""))
    ) +
    
    # Set the coordinate system. This clips everything to the globe's boundary.
    coord_sf(crs = equal_earth_crs, expand = FALSE) +
    
    # Add titles and a clean theme
    labs(
      title = paste("Year:", year),
      subtitle = "Urban Population"
    ) +
    # Use a minimal theme that doesn't add its own borders or grids
    theme_minimal() +
    theme(
      panel.background = element_rect(fill = "white", color = NA),
      panel.grid = element_blank(), # We drew our own graticules
      axis.text = element_blank(),
      axis.ticks = element_blank(),
      axis.title = element_blank(),
      plot.title = element_text(hjust = 0.5),
      plot.subtitle = element_text(hjust = 0.5)
    )
  
  plot_list[[file_path]] <- p
}

print("All raster images have been processed and plotted.")

# -----------------------------------------------------------------------------
# Arrange Plots into 3x4 Grids and SAVE TO FILES
# -----------------------------------------------------------------------------
plots_per_grid <- 12
num_cols <- 4
num_rows <- 3
num_grids <- ceiling(length(plot_list) / plots_per_grid)

print(paste("Arranging", length(plot_list), "plots into", num_grids, "grids and saving to files..."))

for (i in 1:num_grids) {
  start_index <- (i - 1) * plots_per_grid + 1
  end_index <- min(i * plots_per_grid, length(plot_list))
  grid_plots <- plot_list[start_index:end_index]
  
  final_grid <- do.call("grid.arrange", c(grid_plots, ncol = num_cols, nrow = num_rows))
  
  output_filename <- paste0("output_grid_", i, ".png")
  
  ggsave(
    output_filename,
    plot = final_grid,
    width = 38.88,
    height = 19.44,
    units = "in",
    dpi = 150
  )
  print(paste("Saved:", output_filename))
}

print("Script finished. Check your working directory for the output PNG files.")