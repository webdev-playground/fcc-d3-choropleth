const width = 1200;
const height = 1050;

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

const tooltip = d3
  .select('#map')
  .append('div')
  .attr('id', 'tooltip')
  .style('display', 'none');

// Draw Legend
const colorLegend = d3
  .legendColor()
  .scale(eduColorScale)
  .cells(numColors)
  .shapeWidth(30)
  .labelFormat(d3.format('.0f'))
  .labels(d3.legendHelpers.thresholdLabels)
  .orient('vertical');

svg
  .append('g')
  .attr('id', 'legend')
  .attr('transform', `translate(${width - 200},${200})`);

svg.select('#legend').call(colorLegend);

// Draw Map
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
      .attr('fill', d => eduColorScale(eduIdMap.get(d.id).bachelorsOrHigher))
      .on('mouseover', d => {
        tooltip
          .style('display', 'block')
          .attr('data-education', eduIdMap.get(d.id).bachelorsOrHigher)
          .style('left', d3.event.pageX + 5 + 'px')
          .style('top', d3.event.pageY - 30 + 'px')
          .html(() => {
            const eduData = eduIdMap.get(d.id);
            const {
              area_name: countyName,
              state: countyCode,
              bachelorsOrHigher: degreePct,
            } = eduData;
            return `<div>${countyName}, ${countyCode}: ${degreePct}%</div>`;
          });
      })
      .on('mouseout', d => {
        tooltip.style('display', 'none');
      });
  })
  .catch(() => alert('An error occurred!'));
