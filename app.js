const width = 1000;
const height = 1100;

const svg = d3
  .select('#map')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const path = d3.geoPath();

const countiesTopoDataPromise = d3.json(
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
);
const countiesEducationDataPromise = d3.json(
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'
);

const minBachelorPct = 0;
const maxBachelorPct = 100;
const numColors = 8;
const numThresholds = numColors - 1;
const eduColorScale = d3
  .scaleThreshold()
  .domain(d3.range(minBachelorPct, maxBachelorPct, numThresholds))
  .range(d3.schemeBlues[numColors]);

Promise.all([countiesTopoDataPromise, countiesEducationDataPromise])
  .then(values => {
    const countiesTopoData = values[0];
    const countiesEducationData = values[1];

    // convert data from topojson to geojson format
    const geojson = topojson.feature(
      countiesTopoData,
      countiesTopoData.objects.counties
    );

    // map fips value to county education data for quick retrieval
    const eduIdMap = new Map();
    countiesEducationData.forEach(data => {
      eduIdMap.set(data.fips, data);
    });

    svg
      .selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('data-fips', d => d.id)
      .attr('data-education', d => eduIdMap.get(d.id).bachelorsOrHigher)
      .attr('d', path)
      .attr('class', 'county')
      .attr('fill', d => eduColorScale(eduIdMap.get(d.id).bachelorsOrHigher));
  })
  .catch(() => alert('An error occurred!'));
