document.addEventListener("DOMContentLoaded", function(event) {

  var margin={top:20, right:80, bottom:60, left:50};
  var w=960-margin.right, h=500-margin.top-margin.bottom;
  var startYear=1968;
  var currentYear=2017;
  var maxPopulation_cumulative=1200;
  var maxPopulation_Country=1000;
  var maxCirclesize=40;
  var duration=20000,
      delay=1500;

  function country(d){ return d.name; }
  function y(d){ return d.population; }
  function radius(d){ return d.population; }
  function color(d){ return d.region; }

  var xYearScale = d3.scaleBand()
          .range([0, w])
          .padding(1);
  var xCountryScale = d3.scaleBand()
          .range([0, w])
          .padding(1);
  var yScale=d3.scaleSqrt()
          .domain([0,maxPopulation_cumulative])
          .range([h,0]);
  var colorScale=d3.scaleOrdinal(d3.schemeCategory10);
  var radiusScale=d3.scaleSqrt()
          .domain([0,maxPopulation_Country])
          .range([0,maxCirclesize]);

  var yAxis=d3.axisLeft().scale(yScale);
  var xAxis=d3.axisBottom(xCountryScale);
  var xYearAxis=d3.axisBottom(xYearScale);

  var temp_var_store_country_population_array=[];

  var svg=d3.select(".avg").append("svg")
            //.attr("width", w+margin.left+margin.right)
            //.attr("height", h+margin.top+margin.bottom)
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("viewBox", "0 0 " + (w+margin.left+margin.right) + " " + (h+margin.top+margin.bottom) )
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", "translate("+margin.left+","+margin.top+")");

  svg.append("g")
     .attr("class", "y axis")
     .call(yAxis);
  svg.append("text")
     .attr("class", "y label")
     .attr("text-anchor", "end")
     .attr("y", 6)
     .attr("dy", ".75em")
     .attr("transform", "rotate(-90)")
     .text("Population");

  svg.append("text")
     .attr("class", "x label")
     .attr("text-anchor", "start")
     .attr("x", w+5)
     .attr("y", h-12)
     .text("Countries color");
 svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "start")
    .attr("x", w+5)
    .attr("y", h)
    .text("coded by region");
  var label= svg.append("text")
                .attr("class", "year label")
                .attr("text-anchor", "end")
                .attr("x", w+75)
                .attr("y", 150)
                .text(startYear);

  d3.queue(1)
    .defer(d3.json,"real.json")
    // .defer(d3.json,"auroville.json")
    .await(populate);

  function populate(error, nations) {

    var bisect=d3.bisector(function(d) { return d[0]; });

    // nations.forEach(function(d){
    //   temp_var_store_country_population_array=[];
    //   d.population=fill_missing_year_data(d.population);
    // });
    // auroville.forEach(function(d){
    //   temp_var_store_country_population_array=[];
    //   d.population=fill_missing_year_data(d.population);
    // });

    nations.sort(function(a, b) {
      return b.region < a.region ?  1
             : b.region > a.region ? -1
             : 0;
           });

   function legend(){
     var allRegions=(nations).map(function(d) {
       return d.region;
     });
     colorScale.domain(allRegions);

     svg.append("g")
       .attr("class", "legend")
       .attr("transform", "translate("+(w)+","+(210)+")");

     var legend = d3.legendColor()
       //.shapeWidth(w/d3.map(objects, function(d) { return d.foo; }).size();)
         .shapeWidth(15)
         .shapePadding(10)
         .orient("vertical")
         .labelWrap(30)
         .scale(colorScale);

     svg.select(".legend")
       .call(legend);
   }
   legend();

   //default x-axis country display
   var allCountries=(nations).map(function(d) {
     return d.name;
   });
   xCountryScale.domain(allCountries);
   svg.append("g")
      .attr("class", "xCountry axis")
      .attr("transform", "translate(0,"+h+")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", function(d) {
         return "rotate(-65)"
         });

    //x-axis years display
    var all_years=[];
    for (var i=startYear; i<=currentYear; i++){
      all_years.push(i);
    }
    xYearScale.domain(all_years);
    svg.append("g")
       .attr("class", "xYear axis")
       .attr("transform", "translate(0,"+h+")")
       .call(xYearAxis)
       .attr("opacity",0)
       .selectAll("text")
       .style("text-anchor", "end")
       .attr("dx", "-.8em")
       .attr("dy", ".15em")
       .attr("transform", function(d) {
          return "rotate(-65)"
          });

     //Nation label top left
     function countryLabel(dot){
       dot.append("text")
       .attr("class", function(d){return "country topleftlabel "+d.name;})
       .attr("text-anchor", "start")
       .attr("x", 24)
       .attr("y", 55)
       .text(function(d) {return d.name; })
       .style("fill", function(d){return colorScale(d.region);});
      }

     // //Auroville label top left
     // svg.append("text")
     //   .attr("class", "country topleftlabel Auroville")
     //   .attr("text-anchor", "start")
     //   .attr("x", 24)
     //   .attr("y", 55)
     //   .text("Auroville")
     //   .style("fill", "#000");

     //Circles on the population trend line of all nations
     var circleGroup_Nation=svg.selectAll(".circlesNation")
             .data(nations)
             .enter()
             .append("g")
             .attr("class", function(d){return "circlesNation "+d.name;})
             .attr("opacity",0)
             .attr("fill", function(d){ return colorScale(d.region);});
     var circlesNation=circleGroup_Nation.selectAll("circle")
                          .data(function(d,i){
                            return (d.population);
                          })
                          .enter()
                          .append("circle");
    var circleAttributesNation=circlesNation.attr("r",3)
              .attr("cx",function(d) {
                return xYearScale(d[0]);
              })
              .attr("cy",function(d,i) {
                return yScale(d[1]);
              });
     var popYearCountry= circleGroup_Nation.selectAll("text")
                          .data(function(d,i){
                            return (d.population);
                          })
                          .enter()
                          .append("text")
                          .style("text-anchor", "start");
     var popYearCountryAttributes=popYearCountry
               // .attr("x",function(d) {
               //   return xYearScale(d[0]);
               // })
               // .attr("y",function(d) {
               //   return 12+yScale(d[1]);
               // })
               .text(function(d) {
                 return d[1];
               })
               .attr("fill", "#000")
               // .attr("dx", "-.8em")
               // .attr("dy", ".15em")
               .attr("transform", function(d) {
                 return "translate(" + (xYearScale(d[0])) + "," + (yScale(d[1])-8) +")"+"rotate(-65)";
               });

     //Circles on the population trend line of Auroville
     // var circleGroup_Auroville=svg.selectAll(".circlesAuroville")
     //         .data(auroville)
     //         .enter()
     //         .append("g")
     //         .attr("class", function(d) {
     //           return "circlesAuroville "+d.name;
     //         })
     //         .attr("fill", "#000")
     //         .attr("opacity",0);
     // var circlesAuroville=circleGroup_Auroville.selectAll("circle")
     //                      .data(function(d,i){
     //                        return (d.population);
     //                      })
     //                      .enter()
     //                      .append("circle");
     // var circleAttributesAuroville=circlesAuroville.attr("r",3)
     //           .attr("cx",function(d) {
     //             return xYearScale(d[0]);
     //           })
     //           .attr("cy",function(d,i) {
     //             return yScale(d[1]);
     //           });

     var countryLine=d3.line()
                       .curve(d3.curveCatmullRom)
                       .x(function(d){return xYearScale(d[0]);})
                       .y(function(d){return yScale(d[1]);});

     //All countries trend lines
     svg.append("g")
        .selectAll("path")
        .data(nations)
        .enter()
        .append("path")
        .attr("class", function(d){return "countryGraph "+d.name;})
        .attr("stroke", function(d){ return colorScale(color(d));})
        .attr("stroke-width", "2px")
        .attr("d", function(d){
          temp_var_store_country_population_array_arr_path=d.population;
         return countryLine(d.population);
        });

    // //Auroville population trend line
    // svg.append("g")
    //    .selectAll("path")
    //    .data(auroville)
    //    .enter()
    //    .append("path")
    //    .attr("class", function(d){return "countryGraph "+d.name;})
    //    .attr("stroke", "#000")
    //    .attr("stroke-width", "2px")
    //    .attr("d", function(d){
    //      temp_var_store_country_population_array_arr_path=d.population;
    //     return countryLine(d.population);
    //    });

    //Unique nation dot
    var dot=svg.append("g")
               .attr("class", "dots")
               .selectAll(".dot")
               .data(interpolateData(startYear))
               .enter()
               .call(countryLabel)
               .append("circle")
               .attr("class", function(d){return "dot "+d.name;})
               .attr("fill", function(d) {return colorScale(color(d));})
               .call(position)
               .sort(order)
               .on("mouseover", function(d){
                 svg.transition().duration(0);
                 svg.selectAll(".country, .topleftlabel").filter("."+d.name).style("opacity",1);
                 svg.selectAll(".dot").style("opacity", 0.1);
                 svg.selectAll(".dot").filter("."+d.name).style("opacity", 1);
                 svg.selectAll(".xYear").style("opacity", 1);
                 svg.selectAll(".xCountry").style("opacity", 0);
                 svg.selectAll(".countryGraph").filter("."+d.name).style("opacity", 0.8);
                 svg.selectAll(".circlesNation").filter("."+d.name).style("opacity", 1);
                 // svg.selectAll(".circlesAuroville").style("opacity",1);
                 svg.selectAll(".year, .supporting_text").style("opacity", 0.2);
                })
               .on("mouseleave", function(d){
                 svg.selectAll(".country, .topleftlabel").style("opacity",0);
                 svg.selectAll(".dot").style("opacity", 1);
                 svg.selectAll(".xYear").style("opacity", 0);
                 svg.selectAll(".xCountry").style("opacity", 1);
                 svg.selectAll(".countryGraph").style("opacity", 0);
                 svg.selectAll(".circlesNation").style("opacity", 0);
                 // svg.selectAll(".circlesAuroville").style("opacity",0);
                 svg.selectAll(".year, .supporting_text").style("opacity", 1);
               });

     //transition
     repeat();
     function repeat(){
      svg.transition()
         .delay(delay)
         .duration(duration)
         .ease(d3.easeLinear)
         .tween("year", tweenYear)
         .on("end", enableInteraction);
      }

     function position(dot){
       dot.attr("cx", function(d) { return xCountryScale(country(d));})
          .attr("cy", function(d) { return yScale(y(d));})
          .attr("r", function(d) { return radiusScale(radius(d));});
     }

     function order(a,b){
       return radius(b)-radius(a);
     }


      var box=label.node().getBBox();

      var overlay=svg.append("rect")
                     .attr("class", "overlay")
                     .attr("x", box.x)
                     .attr("y", box.y)
                     .attr("width", box.width)
                     .attr("height", box.height)
                     .on("mouseover", enableInteraction);

      function enableInteraction() {
        var yearScale= d3.scaleLinear()
                         .domain([startYear,currentYear])
                         .range([box.x+10, box.x+box.width-10])
                         .clamp(true);

        svg.transition().duration(0);

        overlay
          .on("mouseover", mouseover)
          .on("mouseout", mouseout)
          .on("mousemove", mousemove)
          .on("mousetouch", mousemove);

        function mouseover(){
          label.classed("active", true);
        }
        function mouseout(){
          label.classed("active", false);
        }
        function mousemove(){
          displayYear(yearScale.invert(d3.mouse(this)[0]));
        }
      }

      function tweenYear(){
        var year=d3.interpolateNumber(startYear,currentYear);
        return function(t) { displayYear(year(t));};
      }

      function displayYear(year){
        dot.data(interpolateData(year), country).call(position).sort(order);
        label.text(Math.round(year));
      }

      function interpolateData(year){
        return nations.map(function(d){
          return {
            name: d.name,
            region: d.region,
            population: interpolateValue(d.population,year)
          };
        });
      }

      // function fill_missing_year_data(population) {
      //   for (var p=startYear;p<=population[population.length-1][0];p++){
      //     temp_var_store_country_population_array.push([p,interpolateValue(population,p)]);
      //   }
      //   return temp_var_store_country_population_array;
      // }

      function interpolateValue(values, year){
        var i= bisect.left(values, year, 0, values.length-1);
        var a=values[i];
        if(i>0){
          var b=values[i-1];
          var t=(year-a[0])/(b[0]-a[0]);
          return a[1]*(1-t)+b[1]*t;
        }
        return a[1];
      }

      svg.append("text")
           .attr("class", "supporting_text right")
           .attr("text-anchor", "end")
           .attr("x", w+65)
           .attr("y", 0)
           .text("Drag pointer across below year value to see population composition for a particular year");

     svg.append("text")
          .attr("class", "supporting_text left")
          .attr("text-anchor", "start")
          .attr("x", 25)
          .attr("y", 0)
          .text("Mouse-over a dot to see country-specific details");


  }
;})
