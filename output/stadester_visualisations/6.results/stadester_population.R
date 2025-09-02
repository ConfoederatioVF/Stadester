# Load necessary libraries
library(jsonlite)
library(tidyverse)
library(scales)

# --- Step 1: Define the Region Configuration in R ---
region_config <- list(
  northern_america = list(colour = c(87, 122, 175), name = "Northern America"),
  latin_america = list(colour = c(71, 165, 101), name = "Latin America"),
  europe = list(colour = c(47, 97, 170), name = "Europe"),
  eastern_europe_and_russia = list(
    colour = c(20, 114, 30),
    name = "Eastern Europe and Russia"
  ),
  central_asia = list(colour = c(41, 193, 175), name = "Central Asia"),
  middle_east = list(colour = c(198, 130, 129), name = "Middle East"),
  maghreb_egypt = list(colour = c(239, 188, 112), name = "Maghreb and Egypt"),
  sub_saharan_africa = list(
    colour = c(155, 101, 77),
    name = "Sub-Saharan Africa"
  ),
  oceania = list(colour = c(0, 205, 143), name = "Oceania"),
  indian_subcontinent = list(
    colour = c(214, 144, 83),
    name = "Indian Subcontinent"
  ),
  southeast_asia = list(colour = c(97, 144, 163), name = "Southeast Asia"),
  eastasia = list(colour = c(173, 62, 62), name = "East Asia"),
  world = list(colour = c(150, 150, 150), name = "World")
)

# --- Step 2: Process the Config for ggplot2 ---
color_mapping <- sapply(region_config, function(region) {
  rgb(region$colour[1], region$colour[2], region$colour[3], maxColorValue = 255)
})

label_mapping <- sapply(region_config, function(region) {
  region$name
})

# --- Step 3: Load and Tidy the JSON data ---
json_file_path <- "./6.results/population.json"
raw_data <- fromJSON(json_file_path)

tidy_population_data <- imap_dfr(raw_data, ~ {
  tibble(
    key = names(.x),
    Value = unlist(.x)
  ) %>%
    mutate(Region_Key = .y)
}) %>%
  separate(
    key,
    into = c("Population_Type", "Year"),
    sep = "-",
    extra = "merge",
    convert = TRUE
  ) %>%
  mutate(
    Population_Type = factor(
      str_to_title(str_replace_all(Population_Type, "_", " ")),
      levels = c("Total Population", "Urban Population", "Rural Population")
    )
  ) %>%
  select(Region_Key, Year, Population_Type, Value) %>%
  filter(!is.na(Value), Value > 0) %>%
  arrange(Region_Key, Population_Type, Year)

# --- Step 3.5: Generate Major and Minor Breaks for the Log Scale ---
y_range <- range(tidy_population_data$Value)
powers_of_10 <- floor(log10(y_range[1])):ceiling(log10(y_range[2]))
major_breaks <- 10^powers_of_10
minor_breaks <- as.vector(sapply(powers_of_10, function(p) (2:9) * 10^p))

# --- Step 4: Create the plot with corrected X-axis ---
final_plot_correct_xaxis <- ggplot(
  tidy_population_data,
  aes(
    x = Year,
    y = Value,
    color = Region_Key,
    alpha = Population_Type,
    shape = Population_Type,
    group = interaction(Region_Key, Population_Type)
  )
) +
  geom_line(linewidth = 0.5) +
  geom_point(size = 1.0) +
  scale_y_log10(
    labels = label_number(scale_cut = cut_si("")),
    breaks = major_breaks,
    minor_breaks = minor_breaks
  ) +
  # --- THIS IS THE FIX ---
  # Explicitly set the limits and breaks for the x-axis
  scale_x_continuous(
    limits = c(-10000, 2025),
    breaks = seq(-10000, 2000, by = 1000)
  ) +
  scale_alpha_manual(
    name = "Population Type",
    values = c(
      "Total Population" = 1.0,
      "Urban Population" = 0.75,
      "Rural Population" = 0.5
    )
  ) +
  scale_shape_manual(
    name = "Population Type",
    values = c(
      "Total Population" = 16,
      "Urban Population" = 15,
      "Rural Population" = 17
    )
  ) +
  scale_color_manual(
    name = "Region",
    values = color_mapping,
    labels = label_mapping
  ) +
  labs(
    title = "",
    subtitle = "",
    x = "Year",
    y = "Population, Logarithmic",
    caption = ""
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold", size = 16),
    legend.position = "bottom",
    legend.box = "vertical",
    panel.grid.minor.y = element_line(color = "grey92", linetype = "dashed")
  )

# --- Step 5: Display and save the plot ---
print(final_plot_correct_xaxis)

ggsave(
  "./6.results/global_population_totals_graph.png",
  bg = "white",
  plot = final_plot_correct_xaxis,
  width = 11,
  height = 8,
  dpi = 300
)