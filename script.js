
function createHeatmap(data) {
    const dataset = data.monthlyVariance;
    const baseTemperature = data.baseTemperature;

    // Define dimensions and margins
    const margin = { top: 80, right: 100, bottom: 40, left: 50 }, // Increased top margin
          width = 1700 - margin.left - margin.right,
          height = 700 - margin.top - margin.bottom;

    // Select the existing SVG container
    const svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const x = d3.scaleBand()
        .domain(dataset.map(d => d.year))
        .range([0, width])
        
        console.log(dataset.map(d => ({ year: d.year, x: x(d.year) })));

    const y = d3.scaleBand()
        .domain(dataset.map(d => d.month))
        .range([0, height])
        

    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
        .domain([
            d3.min(dataset, d => baseTemperature + d.variance),
            d3.max(dataset, d => baseTemperature + d.variance)
        ]);

    const tooltip = d3.select("#tooltip");


    // Create the heatmap cells
    svg.selectAll(".cell")
        .data(dataset)
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", d => x(d.year)) // Adjust this if necessary
        .attr("y", d => y(d.month))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("data-month", d => d.month - 1) // Adding data-month attribute
        .attr("data-year", d => d.year ) // Adding data-year attribute
        .attr("data-temp", d => baseTemperature + d.variance) 
        .style("fill", d => colorScale(baseTemperature + d.variance))

        .on("mouseover", function(event, d) {
            const monthNames = [
                "January", "February", "March", "April",
                "May", "June", "July", "August",
                "September", "October", "November", "December"
            ];

            const monthName = monthNames[d.month - 1];
            const temperature = (baseTemperature + d.variance).toFixed(2);

            // Show the tooltip with corresponding data-year
            tooltip
                .style("opacity", 1)
                .attr("data-year", d.year) // Set the data-year attribute in the tooltip
                .html(`Year: ${d.year}<br>Month: ${monthName}<br>Temperature: ${temperature}°C`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })

        // Add mouseout event to hide the tooltip
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        });
    // Add title
    svg.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -40) // Adjusted for spacing
        .attr("text-anchor", "middle")
        .attr('id', 'title')
        .style('font-weight', 'bold')
        .style('font-size', 30)
        .text("Global Temperature Variance Heatmap");

    // Add subtitle
    svg.append("text")
        .attr("class", "subtitle")
        .attr("x", width / 2)
        .attr("y", -20) // Adjusted for spacing below the title
        .attr("text-anchor", "middle")
        .attr('id', 'description')
        .style('font-size', 15)
        .text("From 1753 to Present");

    // Add x-axis
    svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x)
        .tickFormat(d3.format('d'))
        .tickValues(x.domain().filter(year => year % 10 === 0))); // Show only multiples of 10

    // Add y-axis
    svg.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(y)
            .tickFormat((d) => {
                const monthNames = [
                    "January", "February", "March", "April", 
                    "May", "June", "July", "August", 
                    "September", "October", "November", "December"
                ];                return monthNames[d - 1];
            }));

            const legendWidth = 20;
    const legendHeight = height / 2; // Adjust as needed
    const legend = svg.append("legend")
        .attr('id', 'legend')
        .attr("transform", `translate(${width + 50}, 0)`); // Position the legend

    // Create a linear gradient for the legend
    const gradient = d3.scaleLinear()
        .domain([d3.min(dataset, d => baseTemperature + d.variance), d3.max(dataset, d => baseTemperature + d.variance)])
        .range([0, legendHeight]);

    // Add rectangles to the legend
    legend.selectAll("rect")
        .data(d3.range(0, legendHeight))
        .enter().append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => legendHeight - d)
        .attr("width", legendWidth)
        .attr("height", 1)
        .style("fill", (d) => colorScale(gradient.invert(d)));

    // Add legend title
    legend.append("text")
        .attr("x", -50)
        .attr("y", -10)
        .text("Temperature Variance (°C)")
        .attr("text-anchor", "end");


}

// Fetch the data and call the createHeatmap function
fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(response => response.json())
    .then(data => {
        createHeatmap(data);
    })
    .catch(error => console.log('Error fetching the data:', error));
