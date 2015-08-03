var tooltip;

//Circle position
var width = 220;
var height = 220;
var diagram_x_pos = width/2;
var diagram_y_pos = height/2;

var percentageIdentityTextSize = 14;

//Circle attributes
var radius = 25;
var circleThickness = 15;
var gap = 2;
var gapColor = "white";

//Circle text attributes
var font_size = 8;
var font_family = "Arial";
var num_color = "#222222";
var text_weight = "normal";
var text_anchor = "middle";

//Overview variables
var overviewWidth = 900;
var overviewHeight = 300;

var axesWidth = 900;
var axesHeight = 25;

var xScaleMin = 0;
var xScaleMax = 600;

var yScaleMin = 0;
var yScaleMax = 350;

var widthBtnBars = 60;

var firstPatternColor = "#FFFFFF";
var secondPatternColor = "#CCFF00";
var thirdPatternColor = "#00FF00";

var canvas;
var index = 0;

$(document).ready(function() {

    addPattern();
    initializeValues();
});

//Retrieve JSON value and call respective method to display Overview and Alignment information
function initializeValues() {
    $.getJSON("json/test.json", function(data) {

        var all_blast_output = [];

        var numberOfHits = data.iterations[0].hits.length;

        for (var i = 0; i < numberOfHits; i++) {

            var table_id = "table" + i;
            var donut_id = "donut" + i;
            var num_of_regions = data.iterations[0].hits[i].hsps.length;
            var blast_output = [];

            blast_output.push({
                "score": data.iterations[0].hits[i].hsps[0]["score"],
                "evalue" : data.iterations[0].hits[i].hsps[0]["evalue"],
                "identity" : data.iterations[0].hits[i].hsps[0]["identity"],
                "align_len" : data.iterations[0].hits[i].hsps[0]["align-len"],
                "query_len" : data.iterations[0]["query-len"],
                "organism" : data.iterations[0].hits[i].def.split("|")[4].split(" ")[0],
                "query_from" : data.iterations[0].hits[i].hsps[0]["query-from"],
                "query_to" : data.iterations[0].hits[i].hsps[0]["query-to"],
                "hit_from" : data.iterations[0].hits[i].hsps[0]["hit-from"],
                "hit_to" : data.iterations[0].hits[i].hsps[0]["hit-to"],   //Extracting value from object with '-' value in it
                "qseq" : data.iterations[0].hits[i].hsps[0]["qseq"],
                "hseq" : data.iterations[0].hits[i].hsps[0]["hseq"],
                "gaps" : data.iterations[0].hits[i].hsps[0]["gaps"],
                "num_of_regions_left": (num_of_regions)
            });

            for(var j = 1; j < num_of_regions; j++) {
                blast_output.push({
                    'query_from' : data.iterations[0].hits[i].hsps[j]["query-from"],
                    'query_to' : data.iterations[0].hits[i].hsps[j]["query-to"],
                    'hit_from' : data.iterations[0].hits[i].hsps[j]["hit-from"],
                    'hit_to' : data.iterations[0].hits[i].hsps[j]["hit-to"],
                    "align_len" : data.iterations[0].hits[i].hsps[j]["align-len"],
                    "qseq" : data.iterations[0].hits[i].hsps[0]["qseq"],
                    "hseq" : data.iterations[0].hits[i].hsps[0]["hseq"],
                    "gaps" : data.iterations[0].hits[i].hsps[0]["gaps"],
                    "num_of_regions_left": 0
                });
            }

            addTable(table_id, donut_id);
            //Draw alignment arcs for each region [Query, Subject and Gaps]
            drawAlignmentCircle(blast_output, 0, num_of_regions, table_id, donut_id);
            all_blast_output.push.apply(all_blast_output, blast_output);
        }

        //Draw overview bars [Query, Subject and Gaps]
        drawOverviewBars(all_blast_output, numberOfHits);
    });
}

//Draw Overview bars for query and subject
function drawOverviewBars(blast_data, numberOfHits) {

    var enzymeDetails = [];
    var alignmentLength = [];
    var queryFromValues = [];
    var queryToValues = [];
    var hitFromValues = [];
    var hitToValues = [];
    var queryLength = blast_data[0].query_len;
    var numOfRegionsLeft = [];
    var gaps = [];
    var qseq = [];
    var hseq = [];


    for(var i=0; i < blast_data.length; i++) {
        if(blast_data[i].num_of_regions_left != 0) {
            var identityValue = getIdentityInfo(blast_data, i, blast_data[i].num_of_regions_left);
            enzymeDetails.push("Organism:" + blast_data[i].organism + ", Identity:"+ identityValue
            + ",eValue:"+ blast_data[i].evalue + ", score:"+ blast_data[i].score);
        }
        alignmentLength.push(blast_data[i].align_len);
        queryFromValues.push(blast_data[i].query_from);
        queryToValues.push(blast_data[i].query_to);
        hitFromValues.push(blast_data[i].hit_from);
        hitToValues.push(blast_data[i].hit_to);
        numOfRegionsLeft.push(blast_data[i].num_of_regions_left);
        gaps.push(blast_data[i].gaps);
        qseq.push(blast_data[i].qseq);
        hseq.push(blast_data[i].hseq);
    }

    overviewHeight = 60 + ((numberOfHits-1) * 60);

    if(overviewHeight < 300) {
        overviewHeight = 300;
    }

    //Add svg elements to the div and specify the attributes to it
    canvas = d3.select('#wrapper')
        .append('svg')
        .attr({'width':overviewWidth,'height':overviewHeight});

    // X-axis, Y-axis and Color scale information
    var xScale = d3.scale.linear()
        .domain([0,queryLength])
        .range([xScaleMin,xScaleMax]);

    var yScale = d3.scale.linear()
        .domain([0,numberOfHits])
        .range([yScaleMin,yScaleMax]);

    var colors = ['#0000b4','#0082ca','#0094ff','#0d4bcf','#0066AE','#074285','#00187B','#285964','#405F83','#416545','#4D7069','#6E9985','#7EBC89','#0283AF','#79BCBF','#99C19E'];

    var colorScale = d3.scale.linear()
        .domain([0,queryLength])
        .range(["#0000FF", "#FF0000"]);

    ////Add the patterns to the canvas
    //addPattern();

    //Add axes to the graph
    addAxes(xScale, yScale, enzymeDetails);

    //Add the Query bars to the graph
    addQueryBar(xScale, alignmentLength, queryFromValues, queryToValues, colorScale, numOfRegionsLeft, gaps, qseq);

    //Add the Hit bars to the graph
    addHitBar(xScale, alignmentLength, hitFromValues, hitToValues, colorScale, numOfRegionsLeft, gaps, hseq);
}



//Add the Query bars to the graph
function addQueryBar(xScale, alignmentLength, queryFromValues, queryToValues, colorScale, numOfRegionsLeft, gaps, qseq) {

    var queryBars = canvas.append('g')
        .attr("transform", "translate(150,10)")
        .attr('id','querybars');

    var queryTexts = canvas.append('g')
        .attr("transform", "translate(150,10)")
        .attr('id','queryTexts');

    for(var i= 0, k=0; i<queryFromValues.length;k++) {

        queryBars.append('rect')
            .attr('height',15)
            .attr({'x':xScale(queryFromValues[i]),'y':(10 + (k*widthBtnBars))})
            .style('fill',colorScale(queryToValues[i] - queryFromValues[i] + 1))
            .attr('width',xScale(queryToValues[i] - queryFromValues[i]))
            .attr('id', "queryRect"+i)
            .attr('class', "bars");

        queryTexts.append('text')
            .attr({'x':xScale(parseInt(queryFromValues[i])+5),'y':(9 + (k*widthBtnBars))})
            .text(queryFromValues[i])
            .style({'fill':'#000','font-size':'10px'})
            .attr("id","queryFromText"+i);

        queryTexts.append('text')
            .attr({'x':xScale(parseInt(queryToValues[i])-35),'y':(9 + (k*widthBtnBars))})
            .text(queryToValues[i])
            .style({'fill':'#000','font-size':'10px'})
            .attr("id","queryToText"+i);

        queryBars.select("#queryRect"+i).style("cursor","pointer").attr("title","Query ["+ queryFromValues[i] + " - " + queryToValues[i] + "]");
        queryTexts.select("#queryFromText"+i).style("cursor","pointer").attr("title","Query ["+ queryFromValues[i] + " - " + queryToValues[i] + "]");
        queryTexts.select("#queryToText"+i).style("cursor","pointer").attr("title","Query ["+ queryFromValues[i] + " - " + queryToValues[i] + "]");

        //Add gaps only if there is consecutive 3 gaps
        addQueryGaps(gaps, i, qseq, queryBars, xScale, k);

        for(var j=1; j<numOfRegionsLeft[i]; j++) {
            queryBars.append('rect')
                .attr('height',15)
                .attr({'x':xScale(queryFromValues[i+j]),'y':(10 + (k*widthBtnBars))})
                .style('fill',colorScale(queryToValues[i+j] - queryFromValues[i+j] + 1))
                .attr('width',xScale(queryToValues[i+j] - queryFromValues[i+j]));

            queryBars.append('rect')
                .attr('height',15)
                .attr({'x':xScale(queryFromValues[i+j]),'y':(10 + (k*widthBtnBars))})
                .attr('width',xScale(queryToValues[i+j] - queryFromValues[i+j]))
                .attr('fill', 'url(#pattern' + j +')')
                .attr("id","queryRect"+(i+j));

            queryTexts.append('text')
                .attr({'x':xScale(parseInt(queryFromValues[i+j])+5),'y':(9 + (k*widthBtnBars))})
                .text(queryFromValues[i+j])
                .style({'fill':'#000000','font-size':'10px'})
                .attr("id","queryFromText"+(i+j));

            queryTexts.append('text')
                .attr({'x':xScale(parseInt(queryToValues[i+j])-25),'y':(9 + (k*widthBtnBars))})
                .text(queryToValues[i+j])
                .style({'fill':'#000000','font-size':'10px'})
                .attr("id","queryToText"+(i+j));

            queryBars.select("#queryRect"+(i+j)).style("cursor","pointer").attr("title","Query ["+ queryFromValues[i+j] + " - " + queryToValues[i+j] + "]");
            queryTexts.select("#queryFromText"+(i+j)).style("cursor","pointer").attr("title","Query ["+ queryFromValues[i+j] + " - " + queryToValues[i+j] + "]");
            queryTexts.select("#queryToText"+(i+j)).style("cursor","pointer").attr("title","Query ["+ queryFromValues[i+j] + " - " + queryToValues[i+j] + "]");

            //Add gaps only if there is consecutive 3 gaps
            addQueryGaps(gaps, (i+j) , qseq, queryBars, xScale, k);
        }

        if(numOfRegionsLeft[i] > 1) {
            i = i+numOfRegionsLeft[i];
        } else {
            i++;
        }
    }
}

//Add gaps only if there is consecutive 3 gaps
function addQueryGaps(gaps, i, sequ, bars, xScale, k) {
    if(gaps[i] > 2) {
        var allGapsInQuery = getAllIndexes(sequ[i], "-");

        for(var l= 0; l<allGapsInQuery.length;) {
            var x=0;
            var initialValue = allGapsInQuery[l];
            while((allGapsInQuery[l]+1) == allGapsInQuery[l+1]) {
                x++;
                l++;
            }

            if(x>1) {

                bars.append('rect')
                    .attr('height',15)
                    .style("z-index", "20")
                    .attr({'x':xScale(initialValue),'y':(10 + (k*widthBtnBars))})
                    .style('fill',gapColor)
                    .attr('width',xScale(parseInt(initialValue+x) - initialValue))
                    .attr("id","queryRectGap"+(i+l));

                bars.select("#queryRectGap"+(i+l)).style("cursor","pointer").attr("title","Query Gap ["+ initialValue + " - " + parseInt(initialValue+x) + "]");
            }
            l++;
        }
    }
}



//Add the hit bars to the graph
function addHitBar(xScale, alignmentLength, hitFromValues, hitToValues, colorScale, numOfRegionsLeft, gaps, hseq) {
    var hitBars = canvas.append('g')
        .attr("transform", "translate(150,10)")
        .attr('id','hitbars');

    var hitTexts = canvas.append('g')
        .attr("transform", "translate(150,10)")
        .attr('id','hitTexts');

    for(var i= 0, k=0; i<hitFromValues.length;k++) {
        hitBars.append('rect')
            .attr('height',15)
            .attr({'x':xScale(hitFromValues[i]),'y':(27 + (k*widthBtnBars))})
            .style('fill',colorScale(hitToValues[i] - hitFromValues[i]+1))
            .attr('width',xScale(hitToValues[i] - hitFromValues[i]))
            .attr("id","hitRect"+i);

        hitTexts.append('text')
            .attr({'x':xScale(parseInt(hitFromValues[i])+5),'y':(52 + (k*widthBtnBars))})
            .text(hitFromValues[i])
            .style({'fill':'#000','font-size':'10px'})
            .style("z-index", "10")
            .attr("id","hitFromText"+i);

        hitTexts.append('text')
            .attr({'x':xScale(parseInt(hitToValues[i])-25),'y':(52 + (k*widthBtnBars))})
            .text(hitToValues[i])
            .style({'fill':'#000','font-size':'10px'})
            .style("z-index", "10")
            .attr("id","hitToText"+i);

        hitBars.select("#hitRect"+i).style("cursor","pointer").attr("title","Subject ["+ hitFromValues[i] + " - " + hitToValues[i] + "]");
        hitTexts.select("#hitFromText"+i).style("cursor","pointer").attr("title","Subject ["+ hitFromValues[i] + " - " + hitToValues[i] + "]");
        hitTexts.select("#hitToText"+i).style("cursor","pointer").attr("title","Subject ["+ hitFromValues[i] + " - " + hitToValues[i] + "]");

        //Add gaps only if there is consecutive 3 gaps
        addHitGaps(gaps, i, hseq, hitBars, xScale, k);

        for(var j=1; j<numOfRegionsLeft[i]; j++) {
            hitBars.append('rect')
                .attr('height',15)
                .attr({'x':xScale(hitFromValues[i+j]),'y':(27 + (k*widthBtnBars))})
                .style('fill',colorScale(parseInt(hitToValues[i+j]) - parseInt(hitFromValues[i+j]) + 1))
                .attr('width',xScale(parseInt(hitToValues[i+j]) - parseInt(hitFromValues[i+j])));

            hitBars.append('rect')
                .attr('height',15)
                .attr({'x':xScale(hitFromValues[i+j]),'y':(27 + (k*widthBtnBars))})
                .attr('width',xScale(parseInt(hitToValues[i+j]) - parseInt(hitFromValues[i+j])))
                .attr('fill', 'url(#pattern' + j +')')
                .attr("id","hitRect"+(i+j));

            hitTexts.append('text')
                .attr({'x':xScale(parseInt(hitFromValues[i+j])+2),'y':(52 + (k*widthBtnBars))})
                .text(hitFromValues[i+j])
                .style({'fill':'#000','font-size':'10px'})
                .attr("id","hitFromText"+(i+j));

            hitTexts.append('text')
                .attr({'x':xScale(parseInt(hitToValues[i+j])-25),'y':(52 + (k*widthBtnBars))})
                .text(hitToValues[i+j])
                .style({'fill':'#000','font-size':'10px'})
                .attr("id","hitToText"+(i+j));

            hitBars.select("#hitRect"+(i+j)).style("cursor","pointer").attr("title","Subject ["+ hitFromValues[i+j] + " - " + hitToValues[i+j] + "]");
            hitTexts.select("#hitFromText"+(i+j)).style("cursor","pointer").attr("title","Subject ["+ hitFromValues[i+j] + " - " + hitToValues[i+j] + "]");
            hitTexts.select("#hitToText"+(i+j)).style("cursor","pointer").attr("title","Subject ["+ hitFromValues[i+j] + " - " + hitToValues[i+j] + "]");

            //Add gaps only if there is consecutive 3 gaps
            addHitGaps(gaps, (i+j), hseq, hitBars, xScale, k);
        }

        if(numOfRegionsLeft[i] > 1) {
            i = i+numOfRegionsLeft[i];
        } else {
            i++;
        }
    }
}

//Add gaps only if there is consecutive 3 gaps
function addHitGaps(gaps, i, sequ, bars, xScale, k) {
    if(gaps[i] > 2) {
        var allGapsInQuery = getAllIndexes(sequ[i], "-");

        for(var l= 0; l<allGapsInQuery.length;) {
            var x=0;
            var initialValue = allGapsInQuery[l];
            while((allGapsInQuery[l]+1) == allGapsInQuery[l+1]) {
                x++;
                l++;
            }

            if(x>1) {

                bars.append('rect')
                    .attr('height',15)
                    .style("z-index", "20")
                    .attr({'x':xScale(initialValue),'y':(27 + (k*widthBtnBars))})
                    .style('fill',gapColor)
                    .attr('width',xScale(parseInt(initialValue+x) - initialValue))
                    .attr("id","hitRectGap"+(i+l));

                bars.select("#hitRectGap"+(i+l)).style("cursor","pointer").attr("title","Subject Gap ["+ initialValue + " - " + parseInt(initialValue+x) + "]");
            }
            l++;
        }
    }
}

//Draw alignment arcs for each region [Query, Subject and Gaps]
function drawAlignmentCircle(blast_data, index, num_of_regions, table_id, donut_id) {

    //Initialize the alignment information
    var percentageIdentity = initAlignmentInfo(blast_data, index, table_id, num_of_regions);

    if(percentageIdentity == "100.00") {
        percentageIdentity = 100;
    }

    var canvas = d3.select("#"+ donut_id)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate("+ diagram_x_pos +","+ diagram_y_pos +")");

    //Start and End of arc
    var myScale = d3.scale.linear().domain([0, blast_data[index].query_len]).range([0, 2 * Math.PI]);
    var arcs = [];

    //Percentage Identity text at center of circle
    canvas.append("text")
        .attr("font-size", percentageIdentityTextSize)
        .attr("transform", "translate(-15,5)")
        .text(percentageIdentity);

    var color = ['red', '#00B7EB', 'yellow','orange'];

    for(var i = 0, j=0; j < num_of_regions; i = i + 2, j++) {
        addQueryArc(canvas, arcs[i], blast_data[index+j], myScale, color[j]);
        addHitArc(canvas, arcs[i+1], blast_data[index+j], myScale, j+1, color[j]);
    }
}

//Append Query arc to the circle
function addQueryArc(canvas, arc, data, scale, color) {

    arc = d3.svg.arc().innerRadius(radius).outerRadius(radius+circleThickness)
        .startAngle(scale(data.query_from))
        .endAngle(scale(data.query_to));

    //Append the query arc to the canvas
    canvas.append("path").attr("d", arc).attr("fill",color)
        .attr("class", "customTooltip")
        .style("cursor","pointer")
        .attr("title","Query ["+ data.query_from + " - " + data.query_to + "]");

    canvas.append("text")
        .attr("transform", function(d) {
            return "translate("+ fnStartPoints(arc.innerRadius()(d), arc.outerRadius()(d),
                    arc.startAngle()(d)) + ")";
        })
        .attr("font-size", font_size)
        .attr("font-family", font_family)
        .attr("text-anchor", text_anchor)
        .attr("fill", num_color)
        .attr("font-weight", text_weight)
        .text(data.query_from)
        .style("cursor","pointer")
        .attr("title","Query ["+ data.query_from + " - " + data.query_to + "]");

    canvas.append("text")
        .attr("transform", function(d) {
            return "translate("+ fnEndPoints(arc.innerRadius()(d), arc.outerRadius()(d),
                    arc.endAngle()(d)) + ")";
        })
        .attr("font-size", font_size)
        .attr("font-family", font_family)
        .attr("text-anchor", text_anchor)
        .attr("fill", num_color)
        .attr("font-weight", text_weight)
        .text(data.query_to)
        .style("cursor","pointer")
        .attr("title","Query ["+ data.query_from + " - " + data.query_to + "]")
        .attr("class", "customTooltip");

    //Add gaps only if there is consecutive 3 gaps
    if(data.gaps > 2) {
        var allGapsInQuery = getAllIndexes(data.qseq, "-");

        for(var i= 0; i<allGapsInQuery.length;) {
            var j=0;
            var initialValue = allGapsInQuery[i];
            while((allGapsInQuery[i]+1) == allGapsInQuery[i+1]) {
                j++;
                i++;
            }

            if(j>1) {

                arc = d3.svg.arc().innerRadius(radius).outerRadius(radius+circleThickness)
                    .startAngle(scale(initialValue))
                    .endAngle(scale(parseInt(initialValue+j)));

                //Append the Query gap to the canvas
                canvas.append("path").attr("d", arc).attr("fill",gapColor)
                    .style("z-index", "20")
                    .attr("id","queryGaps"+index);

                canvas.select("#queryGaps"+index).style("cursor","pointer")
                    .attr("title","Query ["+ initialValue + " - " + (parseInt(initialValue)+j) + "]")
                    .attr("class", "customTooltip");

                index++;
            }
            i++;
        }
    }
}

//Append hit arc to the circle
function addHitArc(canvas, arc, data, scale, regionNum, color) {

    arc = d3.svg.arc().innerRadius(radius+circleThickness*regionNum+gap*regionNum)
        .outerRadius(radius+circleThickness*(regionNum+1)+gap*regionNum)
        .startAngle(scale(data.query_from))
        .endAngle(scale(data.query_to));

    //Append the hit arc to the canvas
    canvas.append("path").attr("d", arc).attr("fill",color)
        .style("cursor","pointer")
        .attr("title","Subject ["+ data.hit_from + " - " + data.hit_to + "]");

    canvas.append("text")
        .attr("transform", function(d) {
            return "translate("+ fnStartPoints(arc.innerRadius()(d), arc.outerRadius()(d),
                    arc.startAngle()(d)) + ")";
        })
        .attr("font-size", font_size)
        .attr("font-family", font_family)
        .attr("text-anchor", text_anchor)
        .attr("fill", num_color)
        .attr("font-weight", text_weight)
        .text(data.hit_from)
        .style("cursor","pointer")
        .attr("title","Subject ["+ data.hit_from + " - " + data.hit_to + "]");

    canvas.append("text")
        .attr("transform", function(d) {
            return "translate("+ fnEndPoints(arc.innerRadius()(d), arc.outerRadius()(d),
                    arc.endAngle()(d)) + ")";
        })
        .attr("font-size", font_size)
        .attr("font-family", font_family)
        .attr("text-anchor", text_anchor)
        .attr("fill", num_color)
        .attr("font-weight", text_weight)
        .text(data.hit_to)
        .style("cursor","pointer")
        .attr("title","Subject ["+ data.hit_from + " - " + data.hit_to + "]");

    //Add gaps only if there is consecutive 3 gaps
    if(data.gaps > 2) {
        var allGapsInHit = getAllIndexes(data.hseq, "-");

        for(var i= 0; i<allGapsInHit.length;) {
            var j=0;
            var initialValue = allGapsInHit[i];
            while((allGapsInHit[i]+1) == allGapsInHit[i+1]) {
                j++;
                i++;
            }

            if(j>1) {
                arc = d3.svg.arc().innerRadius(radius+circleThickness*regionNum+gap*regionNum)
                    .outerRadius(radius+circleThickness*(regionNum+1)+gap*regionNum)
                    .startAngle(scale(initialValue))
                    .endAngle(scale(parseInt(initialValue+j)));

                //Append the hit gap to the canvas
                canvas.append("path").attr("d", arc).attr("fill",gapColor)
                    .style("z-index", "20")
                    .attr("id","hitGaps"+index);

                canvas.select("#hitGaps"+index).style("cursor","pointer").attr("title","Subject ["+ initialValue + " - " + (parseInt(initialValue)+j) + "]");

                index++;
            }
            i++;
        }
    }
}

//Add different patterns used for displaying different regions in the Overview screen
function addPattern() {

    canvas = d3.select('#patternDiv')
        .append('svg');

    canvas.append('defs')
        .append('pattern')
        .attr('id', 'pattern1')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 1)
        .attr('height', 5)
        .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('stroke', firstPatternColor)
        .attr('stroke-width', 1);

    canvas.append('defs')
        .append('pattern')
        .attr('id', 'pattern2')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 5)
        .attr('height', 1)
        .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('stroke', secondPatternColor)
        .attr('stroke-width', 1);

    canvas.append('defs')
        .append('pattern')
        .attr('id', 'pattern3')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 5)
        .attr('height', 5)
        .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('stroke', thirdPatternColor)
        .attr('stroke-width', 1);
}

//Get percentage identity Information
function getIdentityInfo(blast_data, index, num_of_regions) {
    var totalAlignment=0;

    for (var i=0; i<num_of_regions; i++) {
        totalAlignment = totalAlignment + parseInt(blast_data[index+i].align_len);
    }
    var identity = ((totalAlignment/blast_data[index].query_len) * 100).toFixed(2);

    return identity;
}

//Add axes to the graph
function addAxes(xScale, yScale, enzymeDetails) {

    //Add x-axis at top
    var canvas_top_axis = d3.select('#xAxis_at_top')
        .append('svg')
        .attr({'width':axesWidth,'height':axesHeight});
    var	xTopAxis = d3.svg.axis()
        .orient('top')
        .scale(xScale);

    canvas_top_axis.append('g')
        .attr("transform", "translate(180,20)")
        .attr('id','topxaxis')
        .call(xTopAxis);

    //Add x-axis at bottom
    var canvas_bottom_axis = d3.select('#xAxis_at_bottom')
        .append('svg')
        .attr({'width':axesWidth,'height':axesHeight});

    var	xAxis = d3.svg.axis()
        .orient('bottom') //Text will be placed at bottom
        .scale(xScale);

    canvas_bottom_axis.append('g')
        .attr("transform", "translate(180,5)")
        .attr('id','bottomxaxis')
        .call(xAxis);

    //Add y-axis at left organism
    var	yAxisLeft = d3.svg.axis()
        .orient('left')
        .scale(yScale)
        .tickSize(1)
        .tickFormat(function(d,i){ return enzymeDetails[i].split(',')[0]; })
        .tickValues(d3.range(enzymeDetails.length));

    canvas.append('g')
        .attr("transform", "translate(150,10)")
        .attr('id','leftyaxis')
        .call(yAxisLeft)
        .selectAll('.tick')
        .attr("transform", function (d,i) {return "translate(" + 0 + "," + (30 + (i*widthBtnBars)) + ")"});

    //Add y-axis at right identity
    var	yAxisRightIdentity = d3.svg.axis()
        .orient('right')
        .scale(yScale)
        .tickSize(1)
        .tickFormat(function(d,i){ return enzymeDetails[i].split(',')[1]; })
        .tickValues(d3.range(enzymeDetails.length));

    canvas.append('g')
        .attr("transform", "translate(752,10)")
        .attr('id','rightyaxis')
        .call(yAxisRightIdentity)
        .selectAll('.tick')
        .attr("transform", function (d,i) {return "translate(" + 0 + "," + (12 + (i*widthBtnBars)) + ")"});

    //Add y-axis at right eValue
    var	yAxisRighteValue = d3.svg.axis()
        .orient('right')
        .scale(yScale)
        .tickSize(0)
        .tickFormat(function(d,i){ return enzymeDetails[i].split(',')[2]; })
        .tickValues(d3.range(enzymeDetails.length));

    canvas.append('g')
        .attr("transform", "translate(753,10)")
        .attr('id','rightyaxis')
        .call(yAxisRighteValue)
        .selectAll('.tick')
        .attr("transform", function (d,i) {return "translate(" + 0 + "," + (24 + (i*widthBtnBars)) + ")"});

    //Add y-axis at right Score
    var	yAxisRightScore = d3.svg.axis()
        .orient('right')
        .scale(yScale)
        .tickSize(0)
        .tickFormat(function(d,i){ return enzymeDetails[i].split(',')[3]; })
        .tickValues(d3.range(enzymeDetails.length));

    canvas.append('g')
        .attr("transform", "translate(753,10)")
        .attr('id','rightyaxis')
        .call(yAxisRightScore)
        .selectAll('.tick')
        .attr("transform", function (d,i) {return "translate(" + 0 + "," + (36 + (i*widthBtnBars)) + ")"});
}

//Get all the occurrences of the val ('-' hyphen sign) in the sequence
function getAllIndexes(sequence, val) {
    var indexes = [], i = -1;
    while ((i = sequence.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

//Initialize alignment information like percentage identity, score, eValue and organism name
function initAlignmentInfo(blast_data, index, table_id, num_of_regions) {

    var totalAlignment=0;

    for (var i=0; i<num_of_regions; i++) {
        totalAlignment = totalAlignment + parseInt(blast_data[index+i].align_len);
    }
    var identity = ((totalAlignment/blast_data[index].query_len) * 100).toFixed(2);
    var score = blast_data[index].score;
    var eValue = displayableEvalue(blast_data, index);
    var organism = blast_data[index].organism;

    //Add the values to corresponding DIV's
    $("#" + table_id + " .identity").text("Identity: "+ identity);
    $("#" + table_id + " .score").text("Score: "+ score);
    $("#" + table_id + " .evalue").text("E-value: "+ eValue);
    $("#" + table_id + " .organism").text(organism);

    return identity;
}

//Convert e-value to a display format
function displayableEvalue(blast_data, index) {

    var eValue = blast_data[index].evalue;

    if(eValue.toString().indexOf("e") !== -1) {
        var firstValue = blast_data[index].evalue.split("e")[0];
        var secondValue = blast_data[index].evalue.split("e")[1];

        return (parseFloat(firstValue).toFixed(2) + "e" + secondValue);
    } else {
        return blast_data[index].evalue;
    }
}

//Add html table to the div. Inside this table alignment circles [Arcs] will be drawn
function addTable(table_id, donut_id) {
    $(".diagrams").append('<table class="table-design col-md-3" id="' + table_id + '">'
    + '<tbody>'
    + '<tr>'
    + '<td rowspan="3">'
    + '<svg class="diagram" id="'+ donut_id +'"></svg>'
    + '</td>'
    + '<td class="td-div-design">'
    + '<button class="btn btn-default btn-custom-width identity" disabled></button>'
    + '</td>'
    + '</tr>'

    + '<tr>'
    + '<td class="td-div-design">'
    + '<button class="btn btn-default btn-custom-width score" disabled></button>'
    + '</td>'
    + '</tr>'

    + '<tr>'
    + '<td class="td-div-design">'
    + '<button class="btn btn-default btn-custom-width evalue" disabled></button>'
    + '</td>'
    + '</tr>'

    + '<tr>'
    + '<td class="organism-info" colspan="2">'
    + '<button class="btn btn-default organism" style="font-size: 12px" disabled></button>'
    + '</td>'
    + '</tr>'
    + '</tbody>'
    + '</table>');
}

//Place text in the centroid of the arc
function fnCentroid(inner, outer, start, end) {

    var r = (inner  + outer) / 2, a = ((start + end) / 2) - (Math.PI/2);
    return [ Math.cos(a) * r, Math.sin(a) * r ];
}

//Place text at the start of the arc
function fnStartPoints(inner, outer, start) {

    var r = (inner  + outer - 4) / 2, a = ((start+0.15)) - (Math.PI/2);
    return [ Math.cos(a) * r, Math.sin(a) * r ];
}

//Place text at the end of the arc
function fnEndPoints(inner, outer, end) {

    var r = (inner  + outer - 4) / 2, a = ((end -0.15)) - (Math.PI/2);
    return [ Math.cos(a) * r, Math.sin(a) * r ];
}

function mouseover() {
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 36);
}

function mouseout() {
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 8);
}

function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

//Important. Keep this for transition and animation
//var transit = d3.select("svg").selectAll("#querybars rect")
//    .data(alignmentLength)
//    .transition()
//    .duration(1000)
//    .attr("width", function(d) {return xscale(d); });
