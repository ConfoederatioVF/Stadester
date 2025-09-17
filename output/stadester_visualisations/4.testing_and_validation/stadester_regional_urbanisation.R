# Install and load necessary libraries
# Ensure you have these packages installed: install.packages(c("ggplot2", "dplyr", "tidyr", "scales", "cowplot"))
  
library(ggplot2)
library(dplyr)
library(tidyr)
library(scales)
library(cowplot)

# Load the dataset from the specified relative file path
file_path <- './6.results/regional_urbanisation.csv'
regional_data <- read.csv(file_path)

# Get the unique list of regions to create a plot for each one
regions <- unique(regional_data$region)

# Initialize a list to store each plot object
plot_list <- list()

# Define a set of colors for the lines
line_colors <- c(
  "Total Population" = "black",
  "Urban Population" = "cornflowerblue",
  "Rural Population" = "darkgreen",
  "Urban Share" = "red",
  "Rural Share" = "orange"
)

# Loop through each region to create its specific plot
for (current_region in regions) {
  
  tryCatch({
    
    # 1. --- Filter and Clean Data ---
    region_df <- regional_data %>%
      filter(region == current_region) %>%
      mutate(
        across(c(rural_population, total_population, urban_population), ~if_else(.x > 0, .x, NA_real_))
      )
    
    # 2. --- Calculate Scaling Parameters & Perform Robustness Check ---
    all_pop_values <- c(region_df$rural_population, region_df$total_population, region_df$urban_population)
    finite_pop_values <- all_pop_values[is.finite(all_pop_values)]
    
    if (length(finite_pop_values) < 2) {
      cat("Skipping region '", current_region, "' due to insufficient valid population data.\n", sep = "")
      next
    }
    
    min_pop <- min(finite_pop_values, na.rm = TRUE)
    max_pop <- max(finite_pop_values, na.rm = TRUE)
    
    if (min_pop >= max_pop) {
      cat("Skipping region '", current_region, "' due to zero or negative data range for log scaling.\n", sep = "")
      next
    }
    
    # 3. --- Define and Apply Transformation ---
    scaler <- function(s, min_val, max_val) {
      10^(log10(min_val) + s * (log10(max_val) - log10(min_val)))
    }
    
    plot_df <- region_df %>%
      mutate(
        urban_share_scaled = scaler(urban_share, min_pop, max_pop),
        rural_share_scaled = scaler(rural_share, min_pop, max_pop)
      )
    
    # 4. --- Manually Define Secondary Axis Breaks and Labels ---
    sec_axis_breaks_values <- c(0, 0.25, 0.5, 0.75, 1.0)
    sec_axis_breaks_scaled <- scaler(sec_axis_breaks_values, min_pop, max_pop)
    sec_axis_labels <- scales::percent(sec_axis_breaks_values, accuracy = 1)
    
    # 5. --- Create the Plot ---
    p <- ggplot(plot_df, aes(x = year)) +
      geom_line(aes(y = total_population, color = "Total Population"), size = 1, na.rm = TRUE) +
      geom_line(aes(y = urban_population, color = "Urban Population"), size = 1, na.rm = TRUE) +
      geom_line(aes(y = rural_population, color = "Rural Population"), size = 1, na.rm = TRUE) +
      geom_line(aes(y = urban_share_scaled, color = "Urban Share"), linetype = "dashed", size = 1, na.rm = TRUE) +
      geom_line(aes(y = rural_share_scaled, color = "Rural Share"), linetype = "dashed", size = 1, na.rm = TRUE) +
      
      # --- Scales and Axes ---
      scale_y_log10(
        name = "Population (Log Scale)",
        labels = label_number(scale_cut = cut_si("")),
        sec.axis = sec_axis(
          trans = ~ .,
          name = "Share (Linear Scale)",
          breaks = sec_axis_breaks_scaled,
          labels = sec_axis_labels
        )
      ) +
      
      # CORRECTED: Set explicit limits and breaks for the x-axis
      scale_x_continuous(
        name = "Year",
        limits = c(-3000, 2025),
        breaks = scales::breaks_pretty(n = 6) # Suggests ~6 nice break points
      ) +
      
      scale_color_manual(name = "Metric", values = line_colors) +
      
      # --- Titles and Theming ---
      ggtitle(gsub("_", " ", current_region)) +
      theme_minimal() +
      theme(
        plot.title = element_text(hjust = 0.5, face = "bold"),
        legend.position = "none"
      )
    
    plot_list[[current_region]] <- p
    
  }, error = function(e) {
    cat("Could not generate plot for region '", current_region, "'. Error: ", e$message, "\n", sep = "")
  })
}

# --- Final Assembly ---
if (length(plot_list) > 0) {
  legend <- get_legend(
    plot_list[[1]] +
      guides(color = guide_legend(nrow = 1)) +
      theme(legend.position = "bottom")
  )
  
  plot_grid <- plot_grid(plotlist = plot_list, ncol = 3, nrow = 4)
  
  title <- ggdraw() +
    draw_label(
      "Regional Urbanisation Trends: Population vs. Share",
      fontface = 'bold', x = 0, hjust = 0
    ) +
    theme(plot.margin = margin(0, 0, 0, 7))
  
  final_plot <- plot_grid(title, plot_grid, legend, ncol = 1, rel_heights = c(0.05, 1, 0.05))
  
  print(final_plot)
  
  # To save the plot, you can use ggsave()
  ggsave("regional_urbanisation_grid.png", final_plot, width = 18, height = 20, dpi = 300)
} else {
  print("No valid data was available to generate any plots.")
}