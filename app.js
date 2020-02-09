const width = 1000;
const height = 1100;

const svg = d3
  .select('#map')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const path = d3.geoPath();

d3.json(
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
)
  .then(countiesTopoData => {
    // convert data from topojson to geojson format
    const geojson = topojson.feature(
      countiesTopoData,
      countiesTopoData.objects.counties
    );
    console.log(geojson.features);
    svg
      .selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', 'county');
  })
  .catch(() => alert('An error occurred!'));
