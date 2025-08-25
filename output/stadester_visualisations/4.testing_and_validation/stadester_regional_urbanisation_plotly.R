# THIS R CODE IS BUGGED! DO NOT USE

library(plotly)
library(dplyr)
library(scales)

# Load the dataset
file_path <- './4.testing_and_validation/regional_urbanisation.csv'
regional_data <- read.csv(file_path)

regions <- unique(regional_data$region)
plot_list <- list()

line_colors <- c(
  "Total Population" = "black",
  "Urban Population" = "cornflowerblue",
  "Rural Population" = "darkgreen",
  "Urban Share" = "red",
  "Rural Share" = "orange"
)

for (i in seq_along(regions)) {
  current_region <- regions[i]
  region_df <- regional_data %>%
    filter(region == current_region) %>%
    mutate(
      across(c(rural_population, total_population, urban_population), ~if_else(.x > 0, .x, NA_real_))
    )
  
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
  
  # Axis names for subplot
  y_left  <- paste0("y", ifelse(i == 1, "", i))
  y_right <- paste0("y", ifelse(i == 1, "2", paste0(i, "2")))
  x_axis  <- paste0("x", ifelse(i == 1, "", i))
  
  # Build plot for this region
  p <- plot_ly(region_df, x = ~year, showlegend = (i == 1)) # Only show legend on first plot
  
  if (any(!is.na(region_df$total_population))) {
    p <- p %>%
      add_lines(
        y = ~total_population,
        name = "Total Population",
        line = list(color = line_colors["Total Population"], width = 2),
        hoverinfo = "text",
        text = ~paste("Year:", year, "<br>Total Population:", total_population),
        yaxis = y_left
      )
  }
  if (any(!is.na(region_df$urban_population))) {
    p <- p %>%
      add_lines(
        y = ~urban_population,
        name = "Urban Population",
        line = list(color = line_colors["Urban Population"], width = 2),
        hoverinfo = "text",
        text = ~paste("Year:", year, "<br>Urban Population:", urban_population),
        yaxis = y_left
      )
  }
  if (any(!is.na(region_df$rural_population))) {
    p <- p %>%
      add_lines(
        y = ~rural_population,
        name = "Rural Population",
        line = list(color = line_colors["Rural Population"], width = 2),
        hoverinfo = "text",
        text = ~paste("Year:", year, "<br>Rural Population:", rural_population),
        yaxis = y_left
      )
  }
  if (any(!is.na(region_df$urban_share))) {
    p <- p %>%
      add_lines(
        y = ~urban_share,
        name = "Urban Share",
        line = list(color = line_colors["Urban Share"], dash = "dash", width = 2),
        hoverinfo = "text",
        text = ~paste("Year:", year, "<br>Urban Share:", percent(urban_share, accuracy = 1)),
        yaxis = y_right
      )
  }
  if (any(!is.na(region_df$rural_share))) {
    p <- p %>%
      add_lines(
        y = ~rural_share,
        name = "Rural Share",
        line = list(color = line_colors["Rural Share"], dash = "dash", width = 2),
        hoverinfo = "text",
        text = ~paste("Year:", year, "<br>Rural Share:", percent(rural_share, accuracy = 1)),
        yaxis = y_right
      )
  }
  
  # Add axis titles only to leftmost and bottom plots for clarity
  x_title <- ifelse(i > (length(regions) - 3), "Year", "")
  y_title <- ifelse((i - 1) %% 3 == 0, "Population (Log Scale)", "")
  y2_title <- ifelse((i %% 3) == 0, "Share (Linear Scale)", "")
  
  p <- p %>%
    layout(
      title = list(text = gsub("_", " ", current_region), x = 0.5, font = list(size = 14)),
      xaxis = list(
        title = x_title,
        range = c(-3000, 2025),
        tickmode = "array",
        tickvals = pretty(region_df$year, n = 6)
      ),
      yaxis = list(
        title = y_title,
        type = "log",
        tickformat = ",.0f",
        showgrid = TRUE,
        side = "left"
      ),
      yaxis2 = list(
        title = y2_title,
        overlaying = "y",
        side = "right",
        range = c(0, 1),
        tickvals = c(0, 0.25, 0.5, 0.75, 1.0),
        ticktext = percent(c(0, 0.25, 0.5, 0.75, 1.0), accuracy = 1),
        showgrid = FALSE
      )
    )
  
  plot_list[[i]] <- p
}

# --- Final Assembly ---
if (length(plot_list) > 0) {
  ncol <- 3
  nrow <- ceiling(length(plot_list) / ncol)
  subplot_grid <- subplot(
    plot_list,
    nrows = nrow,
    shareX = FALSE,
    shareY = FALSE,
    titleX = TRUE,
    titleY = TRUE,
    margin = 0.05
  ) %>%
    layout(
      title = list(
        text = "Regional Urbanisation Trends: Population vs. Share",
        x = 0,
        xanchor = "left",
        font = list(size = 20, family = "Arial", color = "black")
      ),
      legend = list(
        orientation = "h",
        x = 0.5,
        xanchor = "center",
        y = -0.1
      )
    )
  
  print(subplot_grid)
  # To save as HTML:
  # htmlwidgets::saveWidget(subplot_grid, "regional_urbanisation_grid.html")
} else {
  print("No valid data was available to generate any plots.")
}