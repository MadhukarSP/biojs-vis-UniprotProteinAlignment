var tooltip;

//Circle position
var width = 220;
var height = 220;

//Circle attributes
var radius = 25;
var gapColor = "#FFFF00";
var gapLineColor = "#000000";

//Overview variables
var overviewWidth = 800;
var overviewHeight = 300;

var axesWidth = 800;
var axesHeight = 25;

var xScaleMin = 0;
var xScaleMax = 600;

var yScaleMin = 0;
var yScaleMax = 350;

var widthBtnBars = 30;

var colorAt0 = "#0000FF";
var colorAt50 = "#00FF00";
var colorAt100 = "#FF0000";

var firstPatternColor = "#FFFFFF";
var secondPatternColor = "#CCFF00";
var thirdPatternColor = "#00FF00";


var QueryBarX_translate = 140;
var QueryBarY_translate = 10;

var QueryTextX_translate = 140;
var QueryTextY_translate = 10;

var x_axis_top_x_translate = 140;
var x_axis_top_y_translate = 20;

var x_axis_bottom_x_translate = 140;
var x_axis_bottom_y_translate = 5;

var QueryDropDownX_translate = 10;
var QueryDropDownY_translate = 19;

var hitBarX_translate = 140;
var hitBarY_translate = 10;

var hitTextX_translate = 140;
var hitTextY_translate = 10;

var ellipse = "...";
var overlapThreshold = 20.0;

var barHeight = 10;

var queryYValue = 10;
var queryGapLineYValue = 14;

var hitYValue = 22;
var hitGapLineYValue = 26;

var canvas;
var index = 0;

$(document).ready(function() {

    addPattern();
    initializeValues();

    $(document).tooltip({
        content: function() {
            return $(this).attr('title');
        },
        style: {
            width: "50px",
            height: "100px"
        },
        track: true
    });
});

//Retrieve JSON value and call respective method to display Overview and Alignment information
function initializeValues() {
    $.getJSON("json/UniProt.json", function(data) {

        var all_blast_output = [];

        var dataObj = data.BlastOutput2["report"]["results"]["search"];

        var numberOfHits = dataObj.hits.length;

        for (var i = 0; i < numberOfHits; i++) {

            var num_of_regions = dataObj.hits[i].hsps.length;
            var blast_output = [];

            blast_output.push({
                "def": dataObj.hits[i]["description"][0]["id"] + dataObj.hits[i]["description"][0]["title"],
                "score": dataObj.hits[i].hsps[0]["score"],
                "evalue" : dataObj.hits[i].hsps[0]["evalue"],
                "identity" : dataObj.hits[i].hsps[0]["identity"],
                "positive" : dataObj.hits[i].hsps[0]["positive"],
                "align_len" : dataObj.hits[i].hsps[0]["align_len"],
                "query_len" : dataObj["query_len"],
                "organism" : dataObj.hits[i]["description"][0]["sciname"],
                "query_from" : dataObj.hits[i].hsps[0]["query_from"],
                "query_to" : dataObj.hits[i].hsps[0]["query_to"],
                "hit_from" : dataObj.hits[i].hsps[0]["hit_from"],
                "hit_to" : dataObj.hits[i].hsps[0]["hit_to"],   //Extracting value from object with '-' value in it
                "qseq" : dataObj.hits[i].hsps[0]["qseq"],
                "hseq" : dataObj.hits[i].hsps[0]["hseq"],
                "midLine": dataObj.hits[i].hsps[0]["midline"],
                "gaps" : dataObj.hits[i].hsps[0]["gaps"],
                "num_of_regions_left": (num_of_regions),
                "added":"N"
            });

            for(var j = 1; j < num_of_regions; j++) {
                blast_output.push({
                    "def": dataObj.hits[i]["description"][0]["id"] + dataObj.hits[i]["description"][0]["title"],
                    'score' : dataObj.hits[i].hsps[j]["score"],
                    'evalue' : dataObj.hits[i].hsps[j]["evalue"],
                    "identity" : dataObj.hits[i].hsps[j]["identity"],
                    "positive" : dataObj.hits[i].hsps[j]["positive"],
                    'query_from' : dataObj.hits[i].hsps[j]["query_from"],
                    'query_to' : dataObj.hits[i].hsps[j]["query_to"],
                    'hit_from' : dataObj.hits[i].hsps[j]["hit_from"],
                    'hit_to' : dataObj.hits[i].hsps[j]["hit_to"],
                    "align_len" : dataObj.hits[i].hsps[j]["align-len"],
                    "qseq" : dataObj.hits[i].hsps[j]["qseq"],
                    "hseq" : dataObj.hits[i].hsps[j]["hseq"],
                    "midLine": dataObj.hits[i].hsps[j]["midline"],
                    "gaps" : dataObj.hits[i].hsps[j]["gaps"],
                    "num_of_regions_left": 0
                });
            }

            all_blast_output.push.apply(all_blast_output, blast_output);
        }

        var final_output = [];

        //if(all_blast_output[currentObj].num_of_regions_left != 0) {

        for(var currentObj=0; currentObj< all_blast_output.length;) {

            var nextObj = currentObj + all_blast_output[currentObj].num_of_regions_left;

            if(all_blast_output[currentObj].added == "Y") {
                currentObj = currentObj + all_blast_output[currentObj].num_of_regions_left;
                continue;
            }

            all_blast_output[currentObj].added = "Y";
            final_output.push(all_blast_output[currentObj]);
            //final_output.push.apply(final_output, all_blast_output[currentObj]);
            var num_of_regions = final_output[final_output.length-1].num_of_regions_left;
            for(var i=1; i < num_of_regions;i++) {
                final_output.push(all_blast_output[currentObj + i]);
                //final_output.push.apply(final_output, all_blast_output[currentObj+i]);
            }
            var flag=1;

            for(var j=nextObj; j<all_blast_output.length;) {

                if(all_blast_output[j].added == "N") {
                    if(all_blast_output[currentObj].query_from == all_blast_output[j].query_from
                        && all_blast_output[currentObj].query_to == all_blast_output[j].query_to
                        && all_blast_output[currentObj].hit_from == all_blast_output[j].hit_from
                        && all_blast_output[currentObj].hit_to == all_blast_output[j].hit_to
                        && all_blast_output[currentObj].num_of_regions_left == all_blast_output[j].num_of_regions_left
                        && all_blast_output[currentObj].gaps == all_blast_output[j].gaps) {

                        all_blast_output[j].added = "Y";
                        final_output.push(all_blast_output[j++]);
                        //final_output.push.apply(final_output, all_blast_output[j++]);
                        num_of_regions = final_output[final_output.length-1].num_of_regions_left;
                        for(var i=1; i< num_of_regions;i++) {
                            final_output.push(all_blast_output[j++]);
                            //final_output.push.apply(final_output, all_blast_output[j++]);
                        }
                        flag=0;
                    }
                }
                if(j>=all_blast_output.length) {
                    break;
                } else {
                    if(flag==1) {
                        j = j + all_blast_output[j].num_of_regions_left;
                    }
                    flag=1;
                }
            }

            currentObj = currentObj + all_blast_output[currentObj].num_of_regions_left;

        }

        //Draw overview bars [Query, Subject and Gaps]
        drawOverviewBars(final_output, numberOfHits);
    });
}

//Draw Overview bars for query and subject
function drawOverviewBars(blast_data, numberOfHits) {

    var organismDetails = [];
    var organismNames = [];
    var queryFromValues = [];
    var queryToValues = [];
    var hitFromValues = [];
    var hitToValues = [];
    var queryLength = blast_data[0].query_len;
    var numOfRegionsLeft = [];
    var score = [];
    var eValue = [];
    var def = [];
    var gaps = [];
    var qseq = [];
    var hseq = [];
    var midLine = [];
    var identities = [];
    var positives = [];
    var numOfOrganisms = 1;
    var flag=1;
    var qStart = 0;
    var qLen = 0;
    var hStart = 0;
    var hLen = 0;
    var queryFullLength = 0;
    var alignmentInfoStart = "name='";
    var alignmentInfoEnd = "'";
    var alignmentInfo = "";
    var defValue = "";

    var threshold = Math.floor(queryLength / 100);

    for(var i=0; i < blast_data.length;) {
        if(blast_data[i].num_of_regions_left != 0) {

            var regions = i + blast_data[i].num_of_regions_left ;
            flag=1;

            if(regions < blast_data.length
                && threshold > (blast_data[regions].query_from - blast_data[i].query_from)
                && threshold > (blast_data[regions].query_to - blast_data[i].query_to)
                //&& threshold > (blast_data[regions].hit_from - blast_data[i].hit_from)
                //&& threshold > (blast_data[regions].hit_to - blast_data[i].hit_to)
                && blast_data[i].num_of_regions_left == blast_data[regions].num_of_regions_left) {
                //&& blast_data[i].gaps == blast_data[regions].gaps) {

                numOfOrganisms++;
                qStart = parseInt(blast_data[i].query_from);
                qLen = parseInt(blast_data[i].query_to);
                hStart = parseInt(blast_data[i].hit_from);
                hLen = parseInt(blast_data[i].hit_to);
                queryFullLength = qLen - qStart + 1;

                defValue = blast_data[i].def.replace(/,/g, " ");

                alignmentInfo = alignmentInfoStart + "def:" + defValue
                                + "::Query:"+ qStart + " - " + qLen + "::Score:" + blast_data[i].score
                                + "::eValue:" + blast_data[i].evalue
                                + "::Identities:" + blast_data[i].identity + "/" + queryFullLength
                                + "::Positives:" + blast_data[i].positive + "/" + queryFullLength
                                + "::Gaps:" + blast_data[i].gaps + "/" + queryFullLength
                                + "::QueryStart:"+ qStart + "::QueryEnd:"+ qLen + "::QueryLen:"+ queryFullLength
                                + "::QuerySeq:" + blast_data[i].qseq + "::midLineSeq:"+ blast_data[i].midLine
                                + "::SubStart:"+ hStart + "::SubEnd:"+ hLen + "::SubSeq:"+ blast_data[i].hseq
                                + alignmentInfoEnd;

                organismNames.push(blast_data[i].organism + "-->" + alignmentInfo);

                i = i + blast_data[i].num_of_regions_left;
                continue;
            }
        }

        if(flag == 1) {
            qStart = parseInt(blast_data[i].query_from);
            qLen = parseInt(blast_data[i].query_to);
            hStart = parseInt(blast_data[i].hit_from);
            hLen = parseInt(blast_data[i].hit_to);
            queryFullLength = qLen - qStart + 1;

            defValue = blast_data[i].def.replace(/,/g, " ");

            alignmentInfo = alignmentInfoStart + "def:" + defValue
                            + "::Query:"+ qStart + " - " + qLen + "::Score:" + blast_data[i].score
                            + "::eValue:" + blast_data[i].evalue
                            + "::Identities:" + blast_data[i].identity + "/" + queryFullLength
                            + "::Positives:" + blast_data[i].positive + "/" + queryFullLength
                            + "::Gaps:" + blast_data[i].gaps + "/" + queryFullLength
                            + "::QueryStart:"+ qStart + "::QueryEnd:"+ qLen + "::QueryLen:"+ queryFullLength
                            + "::QuerySeq:" + blast_data[i].qseq + "::midLineSeq:"+ blast_data[i].midLine
                            + "::SubStart:"+ hStart + "::SubEnd:"+ hLen + "::SubSeq:"+ blast_data[i].hseq
                            + alignmentInfoEnd;

            organismNames.push(blast_data[i].organism + "-->" + alignmentInfo);
            organismDetails.push(numOfOrganisms + ","+ organismNames);
            numOfOrganisms = 1;
            organismNames = [];
            flag=0;
        }

        identities.push(blast_data[i].identity);
        positives.push(blast_data[i].positive);
        def.push(blast_data[i].def);
        score.push(blast_data[i].score);
        eValue.push(blast_data[i].evalue);
        queryFromValues.push(blast_data[i].query_from);
        queryToValues.push(blast_data[i].query_to);
        hitFromValues.push(blast_data[i].hit_from);
        hitToValues.push(blast_data[i].hit_to);
        numOfRegionsLeft.push(blast_data[i].num_of_regions_left);
        gaps.push(blast_data[i].gaps);
        qseq.push(blast_data[i].qseq);
        hseq.push(blast_data[i].hseq);
        midLine.push(blast_data[i].midLine);

        i++;
    }

    //overviewHeight = 60 + ((numberOfHits-1) * 60);

    yScaleMax = 55 + ((organismDetails.length -1) * widthBtnBars);
    overviewHeight = yScaleMax;

    if(overviewHeight < 300) {
        overviewHeight = 300;
        yScaleMax = overviewHeight;
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

    var colorScale = d3.scale.linear()
        .domain([0,queryLength/2, queryLength])
        .range([colorAt0, colorAt50, colorAt100]);

    ////Add the patterns to the canvas
    //addPattern();

    //Add axes to the graph
    addAxes(xScale, yScale, organismDetails);

    //Add axes to the graph
    addCheckboxes(organismDetails);

    //Add the Query bars to the graph
    addQueryBar(xScale, queryFromValues, queryToValues, hitFromValues, hitToValues, colorScale, numOfRegionsLeft,
        gaps, qseq, hseq, score, eValue,midLine, def, identities, positives);

    //Add the Hit bars to the graph
    addHitBar(xScale, hitFromValues, hitToValues, queryFromValues,queryToValues, colorScale, numOfRegionsLeft,
        gaps, qseq, hseq, score, eValue,midLine, def, identities, positives);
}

function addCheckboxes(organismDetails) {

    var checkboxesOuter = d3.select('#checkboxSelection')
                            .attr('class', 'col-md-12');

    for(var i=0; i<organismDetails.length; i++) {
        if(organismDetails[i].split(',').length > 2) {

            for(var k=1; k< organismDetails[i].split(',').length;k++) {
                checkboxesOuter.append("foreignObject")
                    .html("<label class=''><input type='checkbox'>" + " - "
                    + organismDetails[i].split(',')[k].split("-->")[0] + ",&nbsp;" + "</label>")
            }
        } else {

            checkboxesOuter.append("foreignObject")
                .html("<label class=''><input type='checkbox'>" + " - "
                + organismDetails[i].split(',')[1].split("-->")[0] + ",&nbsp;" + "</label>")
        }
        //checkboxesOuter.append("foreignObject")
            //.attr("width", 160)
            //.attr("height",35)
            //.append("xhtml:body")
            //.style("font", "12px")
            //.style("z-index", 9)
            //.html("<label class=''><input type='checkbox'>" + " - " + organismDetails[i].split(',')[1].split("-->")[0]
            // + ",&nbsp;" + "</label>")
            //.append("input")
            //.attr("checked", true)
            //.attr("type", "checkbox")
            //.attr("onClick", "change(this)")
            //.append('label')
            //.text(" " + organismDetails[i].split(',')[1].split("-->")[0] + " ");
    }

        //.append('label')
        //.text("Label name ")
        //.append("input")
        //.attr("checked", true)
        //.attr("type", "checkbox")
        //.attr("onClick", "change(this)");
}

//Add axes to the graph
function addAxes(xScale, yScale, organismDetails) {

    //Add x-axis at top
    var canvas_top_axis = d3.select('#xAxis_at_top')
        .append('svg')
        .attr({'width':axesWidth,'height':axesHeight});
    var	xTopAxis = d3.svg.axis()
        .orient('top')
        .scale(xScale);

    canvas_top_axis.append('g')
        .attr("transform", "translate(" + x_axis_top_x_translate + "," + x_axis_top_y_translate + ")")
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
        //.attr("transform", "translate(180,5)")
        .attr("transform", "translate(" + x_axis_bottom_x_translate + "," + x_axis_bottom_y_translate + ")")
        .attr('id','bottomxaxis')
        .call(xAxis);

    var	yAxisLeftDropDown = d3.svg.axis()
        .orient('right')
        .scale(yScale)
        .tickSize(0)
        .tickFormat(function(d,i){return "";})
        .tickValues(d3.range(organismDetails.length));

    var leftAngle = "<";
    var rightAngle = ">";
    var optionName = "option";
    var optionEnd = "</option>";
    var selectStart = 'select class="form-control dropDownMenu"';
    var selectIdStart = 'id="dropDownMenuID';
    var selectIdEnd = '"';
    var selectEnd = "</select>";
    var space = " ";
    var titleStart = "title='";
    var titleEnd = "'";
    var counter = 1;

    canvas.append('g')
        //.attr("transform", "translate(782,24)")
        .attr('id','leftyaxisDropDown')
        .call(yAxisLeftDropDown)
        .selectAll('.tick')
        .attr("transform", function (d,i) {return "translate(" + QueryDropDownX_translate + "," + (QueryDropDownY_translate + (i*widthBtnBars)) + ")"})
        .append("foreignObject")
        .attr("width", 160)
        .attr("height",35)
        .append("xhtml:body")
        .style("font", "12px")
        .style("z-index", 9)
        .append("p")
        .attr("class","truncateText")
        .style("cursor","pointer")
        .html(function(d,i) {
            var optionValues = "";

            if(organismDetails[i].split(',').length > 2) {

                optionValues = leftAngle + selectStart + selectIdStart + counter++ + selectIdEnd + rightAngle + leftAngle + optionName + rightAngle
                                + (organismDetails[i].split(',').length -1) + " hits" + optionEnd;

                for(var k=1; k< organismDetails[i].split(',').length;k++) {
                    optionValues = optionValues + leftAngle + optionName
                                    + space + titleStart + organismDetails[i].split(',')[k].split("-->")[0] + titleEnd
                                    + space + organismDetails[i].split(',')[k].split("-->")[1] + rightAngle
                                    + organismDetails[i].split(',')[k].split("-->")[0] + optionEnd;
                }
                optionValues = optionValues + selectEnd;
            } else {

                optionValues = organismDetails[i].split(',')[1].split("-->")[0];
            }

            return optionValues;
        })
        .attr("title",function(i) {
            if(organismDetails[i].split(',').length <= 2) {
                return organismDetails[i].split(',')[1].split("-->")[0];
            }
        });

    var dropDown = d3.selectAll('.dropDownMenu');

    dropDown.on('change', function() {
        var selectorVal = "#" + this.id + " option:selected";
        fillTableWithValues($(selectorVal).attr("name").split("::"));
    });

}

//Catch the click events on bars
function clickedOnBar(evt) {
    var svgObj = evt.target;

    var alignmentInfo = svgObj.getAttribute('alignmentInfo').split("::");

    fillTableWithValues(alignmentInfo);
}

function fillTableWithValues(alignmentInfo) {

    $("#note").hide();
    $("#tableWrapper").removeAttr("hidden");

    var def = alignmentInfo[0].split("def:")[1];
    var qryOrSub = alignmentInfo[1].split(":")[1];
    var score = alignmentInfo[2].split(":")[1];
    var eValue = alignmentInfo[3].split(":")[1];
    var identity = alignmentInfo[4].split(":")[1];
    var positive = alignmentInfo[5].split(":")[1];
    var gaps = alignmentInfo[6].split(":")[1];
    var qrySeqLength = alignmentInfo[7].split(":")[1] + alignmentInfo[9].split(":")[1];
    var hitSeqLength = alignmentInfo[14].split(":")[1].length;
    var qStart = parseInt(alignmentInfo[7].split(":")[1]);
    var qLen = parseInt(alignmentInfo[8].split(":")[1]);
    var hStart = parseInt(alignmentInfo[12].split(":")[1]);
    var hLen = parseInt(alignmentInfo[13].split(":")[1]);

    $("#sequenceInfo > tbody").html("");

    $("#queryFromTo").text(qStart + "-" + qLen);
    $("#subjectFromTo").text(hStart + "-" + hLen);
    $("#defValue").text(def);
    $("#scoreValue").text(score);
    $("#eValue").text(eValue);
    $("#identityValue").text(identity);
    $("#positiveValue").text(positive);
    $("#gapValue").text(gaps);


    var qrySymbol="<strong>Qry</strong> ";
    var sbjSymbol="<strong>Sub</strong> ";
    var perLine = 50;


    var qryEnd;
    var sbjEnd;
    var gapsInQry;
    var gapsInSub;
    var qEnd;
    var hEnd;
    var qSeq = alignmentInfo[10].split(":")[1];
    var midLine = alignmentInfo[11].split(":")[1];
    var hSeq = alignmentInfo[14].split(":")[1];

    for(var qryStart=0, sbjStart =0 ; qryStart < qrySeqLength && sbjStart < hitSeqLength;) {
        qryEnd = qryStart+perLine > qrySeqLength ? qrySeqLength : qryStart+perLine;
        sbjEnd = sbjStart+perLine > hitSeqLength ? hitSeqLength : sbjStart+perLine;

        gapsInQry = getAllIndexes(qSeq.substring(qryStart, qryEnd), "-").length;
        gapsInSub = getAllIndexes(hSeq.substring(sbjStart, sbjEnd), "-").length;

        qEnd =  qStart+perLine > qLen ? qLen : qStart+perLine-1-gapsInQry;
        hEnd =  hStart+perLine > hLen ? hLen : hStart+perLine-1-gapsInSub;

        $("#sequenceInfo").find('tbody')
            .append($('<tr>')
                .append($('<td>').html(qrySymbol))
                .append($('<td>').text(qStart).attr("class","text-left"))
                .append($('<td>').text(qSeq.substring(qryStart, qryEnd).trim()))
                .append($('<td>').text(qEnd))
        )
            .append($('<tr>')
                .append($('<td>').text(""))
                .append($('<td>').text(""))
                .append($('<td>').text(midLine.substring(sbjStart, sbjEnd)))
                .append($('<td>').text(""))
        )
            .append($('<tr>')
                .attr("class","row-bottom-padding")
                .append($('<td>').html(sbjSymbol))
                .append($('<td>').text(hStart).attr("class","text-left"))
                .append($('<td>').text(hSeq.substring(sbjStart, sbjEnd).trim()))
                .append($('<td>').text(hEnd))
        );

        qryStart= qryStart+perLine;
        sbjStart = sbjStart+perLine;
        qStart= qStart+perLine-gapsInQry;
        hStart = hStart+perLine-gapsInSub;
    }
}

//Add the Query bars to the graph
function addQueryBar(xScale, queryFromValues, queryToValues,hitFromValues, hitToValues, colorScale,
                     numOfRegionsLeft, gaps, qseq, hseq, score, eValue, midLine, def, identities, positives) {

    var queryBars = canvas.append('g')
        .attr("transform", "translate(" + QueryBarX_translate + "," + QueryBarY_translate + ")")
        .attr('id','querybars');

    var queryTexts = canvas.append('g')
        .attr("transform", "translate(" + QueryTextX_translate + "," + QueryTextY_translate + ")")
        .attr('id','queryTexts');

    for(var i= 0, k=0; i<queryFromValues.length;k++) {

        queryBars.append('rect')
            .attr('height',barHeight)
            .attr({'x':xScale(queryFromValues[i]),'y':(queryYValue + (k*widthBtnBars))})
            .style('fill',colorScale(queryToValues[i] - queryFromValues[i] + 1))
            .attr('width',xScale(queryToValues[i] - queryFromValues[i]))
            .attr('id', "queryRect"+i)
            .attr('class', "bars")
            .attr('onclick', "clickedOnBar(evt)");

        //queryTexts.append('text')
        //    .attr({'x':xScale(parseInt(queryFromValues[i])),'y':(9 + (k*widthBtnBars))})
        //    .text(queryFromValues[i])
        //    .style({'fill':'#000','font-size':'10px'})
        //    .attr("id","queryFromText"+i);
        //
        //queryTexts.append('text')
        //    .attr({'x':xScale(parseInt(queryToValues[i])-10),'y':(9 + (k*widthBtnBars))})
        //    .text(queryToValues[i])
        //    .style({'fill':'#000','font-size':'10px'})
        //    .attr("id","queryToText"+i);

        var qrySeqLength = queryFromValues[i] + qseq[i].length;
        var hitSeqLength = hseq[i].length;
        var qStart = parseInt(queryFromValues[i]);
        var qLen = parseInt(queryToValues[i]);
        var queryFullLength = parseInt(queryToValues[i]) - parseInt(queryFromValues[i]) + 1;
        var hStart = parseInt(hitFromValues[i]);
        var hLen = parseInt(hitToValues[i]);

        queryBars.select("#queryRect"+i).style("cursor","pointer")
            .attr("alignmentInfo", "def:" + def[i] + "::Query:"+ queryFromValues[i] + " - " + queryToValues[i] +
            "::Score:" +score[i] + "::eValue:" + eValue[i] + "::Identities:" + identities[i] + "/" + queryFullLength +
            "::Positives:" + positives[i] + "/" + queryFullLength + "::Gaps:" + gaps[i] + "/" + queryFullLength +
            "::QueryStart:"+ qStart + "::QueryEnd:"+ qLen +"::QueryLen:"+ queryFullLength + "::QuerySeq:"+qseq[i] + "::midLineSeq:"+ midLine[i] +
            "::SubStart:"+ hStart + "::SubEnd:"+ hLen + "::SubSeq:"+ hseq[i])
            .attr("title", "Query co-ordinates (" + queryFromValues[i] + " - " + queryToValues[i] + ")");

        //Add gaps only if there is consecutive 3 gaps
        addQueryGaps(gaps, i, qseq, queryBars, xScale, k, qStart);

        for(var j=1; j<numOfRegionsLeft[i]; j++) {
            queryBars.append('rect')
                .attr('height',barHeight)
                .attr({'x':xScale(queryFromValues[i+j]),'y':(queryYValue + (k*widthBtnBars))})
                .style('fill',colorScale(queryToValues[i+j] - queryFromValues[i+j] + 1))
                .attr('width',xScale(queryToValues[i+j] - queryFromValues[i+j]));

            queryBars.append('rect')
                .attr('height',barHeight)
                .attr({'x':xScale(queryFromValues[i+j]),'y':(queryYValue + (k*widthBtnBars))})
                .attr('width',xScale(queryToValues[i+j] - queryFromValues[i+j]))
                .attr('fill', 'url(#pattern' + j +')')
                .attr("id","queryRect"+(i+j))
                .attr('class', "bars")
                .attr('onclick', "clickedOnBar(evt)");

            //if(xScale(parseInt(queryToValues[i+j])-25) - xScale(parseInt(queryFromValues[i+j])+5) < overlapThreshold) {
            //    queryTexts.append('text')
            //        .attr({'x':xScale((parseInt(queryToValues[i+j])-25 + parseInt(queryFromValues[i+j])+5)/2),'y':(6 + (k*widthBtnBars))})
            //        .text(ellipse)
            //        .style({'fill':'#000000','font-size':'20px'})
            //        .style("cursor","pointer")
            //        .attr("id","queryEllipse"+(i+j))
            //        .attr("title", "Query co-ordinates (" + queryFromValues[i+j] + " - " + queryToValues[i+j] + ")");
            //} else {
            //    queryTexts.append('text')
            //        .attr({'x':xScale(parseInt(queryFromValues[i+j])+5),'y':(9 + (k*widthBtnBars))})
            //        .text(queryFromValues[i+j])
            //        .style({'fill':'#000000','font-size':'10px'})
            //        .attr("id","queryFromText"+(i+j));
            //
            //    queryTexts.append('text')
            //        .attr({'x':xScale(parseInt(queryToValues[i+j])-25),'y':(9 + (k*widthBtnBars))})
            //        .text(queryToValues[i+j])
            //        .style({'fill':'#000000','font-size':'10px'})
            //        .attr("id","queryToText"+(i+j));
            //}


            qrySeqLength = qseq[i+j].length;
            hitSeqLength = hseq[i+j].length;
            qStart = parseInt(queryFromValues[i+j]);
            qLen = parseInt(queryToValues[i+j]);
            hStart = parseInt(hitFromValues[i+j]);
            hLen = parseInt(hitToValues[i+j]);
            queryFullLength = qLen - qStart + 1;

            queryBars.select("#queryRect"+(i+j)).style("cursor","pointer")
                .attr("alignmentInfo", "def:" + def[i+j] + "::Query:"+ queryFromValues[i+j] + " - " + queryToValues[i+j] +
                "::Score:" +score[i+j] + "::eValue:" + eValue[i+j] + "::Identities:" + identities[i+j] + "/" + queryFullLength +
                "::Positives:" + positives[i+j] + "/" + queryFullLength + "::Gaps:" + gaps[i+j] + "/" + queryFullLength +
                "::QueryStart:"+ qStart + "::QueryEnd:"+ qLen +"::QueryLen:"+ queryFullLength + "::QuerySeq:"+qseq[i+j] +
                "::midLineSeq:"+ midLine[i+j] + "::SubStart:"+ hStart + "::SubEnd:"+ hLen + "::SubSeq:"+ hseq[i+j])
                .attr("title", "Query co-ordinates (" + queryFromValues[i+j] + " - " + queryToValues[i+j] + ")");


            //Add gaps only if there is consecutive 3 gaps
            addQueryGaps(gaps, (i+j) , qseq, queryBars, xScale, k, qStart);
        }

        if(numOfRegionsLeft[i] > 1) {
            i = i+numOfRegionsLeft[i];
        } else {
            i++;
        }
    }
}

//Add gaps only if there is consecutive 3 gaps
function addQueryGaps(gaps, i, sequ, bars, xScale, k, qStart) {

    var gapsInQuery = 0;
    if(gaps[i] > 2) {
        var allGapsInQuery = getAllIndexes(sequ[i], "-");

        for(var l= 0; l<allGapsInQuery.length;) {
            var x=0;
            var initialValue = allGapsInQuery[l];
            while((allGapsInQuery[l]+1) == allGapsInQuery[l+1]) {
                x++;
                l++;
            }
            gapsInQuery = gapsInQuery + x;
            if(x>1) {

                bars.append('rect')
                    .attr('height',barHeight)
                    .style("z-index", "18")
                    .attr({'x':xScale(parseInt(qStart + initialValue - gapsInQuery)),'y':(queryYValue + (k*widthBtnBars))})
                    .style('fill',gapColor)
                    .attr('width',xScale(parseInt(initialValue+x) - initialValue))
                    .attr("id","queryRectGapBackground"+i+l);

                bars.select("#queryRectGapBackground"+i+l).style("cursor","pointer")
                    .attr("title","Query Gap ["+ (qStart + parseInt(initialValue)) + " - " + (qStart + parseInt(initialValue+x)) + "]");

                bars.append('rect')
                    .attr('height',2)
                    .style("z-index", "20")
                    .attr({'x':xScale(parseInt(qStart + initialValue - gapsInQuery)),'y':(queryGapLineYValue + (k*widthBtnBars))})
                    .style('fill',gapLineColor)
                    .attr('width',xScale(parseInt(initialValue+x) - initialValue))
                    .attr("id","queryRectGap"+i+l);

                bars.select("#queryRectGap"+i+l).style("cursor","pointer")
                    .attr("title","Query Gap ["+ (qStart + parseInt(initialValue)) + " - " + (qStart + parseInt(initialValue+x)) + "]");
            }
            l++;
        }
    }
}



//Add the hit bars to the graph
function addHitBar(xScale, hitFromValues, hitToValues,queryFromValues,queryToValues, colorScale, numOfRegionsLeft,
                   gaps, qseq, hseq,  score, eValue, midLine, def, identities, positives) {

    var hitBars = canvas.append('g')
        .attr("transform", "translate(" + hitBarX_translate + "," + hitBarY_translate + ")")
        .attr('id','hitbars');

    var hitTexts = canvas.append('g')
        .attr("transform", "translate(" + hitTextX_translate + "," + hitTextY_translate + ")")
        .attr('id','hitTexts');

    for(var i= 0, k=0; i<hitFromValues.length;k++) {

        hitBars.append('rect')
            .attr('height',barHeight)
            .attr({'x':xScale(queryFromValues[i]),'y':(hitYValue + (k*widthBtnBars))})
            .style('fill',colorScale(hitToValues[i] - hitFromValues[i]+1))
            .attr('width',xScale(hitToValues[i] - hitFromValues[i]))
            .attr("id","hitRect"+i)
            .attr('class', "bars")
            .attr('onclick', "clickedOnBar(evt)");

        //hitTexts.append('text')
        //    .attr({'x':xScale(parseInt(hitFromValues[i])+5),'y':(52 + (k*widthBtnBars))})
        //    .text(hitFromValues[i])
        //    .style({'fill':'#000','font-size':'10px'})
        //    .style("z-index", "10")
        //    .attr("id","hitFromText"+i);
        //
        //hitTexts.append('text')
        //    .attr({'x':xScale(parseInt(hitToValues[i])-25),'y':(52 + (k*widthBtnBars))})
        //    .text(hitToValues[i])
        //    .style({'fill':'#000','font-size':'10px'})
        //    .style("z-index", "10")
        //    .attr("id","hitToText"+i);

        var qrySeqLength = qseq[i].length;
        var hitSeqLength = hseq[i].length;
        var qStart = parseInt(queryFromValues[i]);
        var qLen = parseInt(queryToValues[i]);
        var hStart = parseInt(hitFromValues[i]);
        var hLen = parseInt(hitToValues[i]);
        var queryFullLength = hLen - hStart + 1;

        hitBars.select("#hitRect"+i).style("cursor","pointer")
            .attr("alignmentInfo", "def:" + def[i] + "::Subject:"+ hitFromValues[i] + " - " + hitToValues[i] +
            "::Score:" +score[i] + "::eValue:" + eValue[i] + "::Identities:" + identities[i] + "/" + queryFullLength +
            "::Positives:" + positives[i] + "/" + queryFullLength + "::Gaps:" + gaps[i] + "/" + queryFullLength +
            "::QueryStart:"+ qStart + "::QueryEnd:"+ qLen +"::QueryLen:"+ queryFullLength + "::QuerySeq:"+qseq[i] + "::midLineSeq:"+ midLine[i] +
            "::SubStart:"+ hStart + "::SubEnd:"+ hLen + "::SubSeq:"+ hseq[i])
            .attr("title", "Subject co-ordinates (" + hitFromValues[i] + " - " + hitToValues[i] + ")");

        //Add gaps only if there is consecutive 3 gaps
        addHitGaps(gaps, i, hseq, hitBars, xScale, k, qStart, hStart);

        for(var j=1; j<numOfRegionsLeft[i]; j++) {
            hitBars.append('rect')
                .attr('height',barHeight)
                .attr({'x':xScale(queryFromValues[i+j]),'y':(hitYValue + (k*widthBtnBars))})
                .style('fill',colorScale(parseInt(hitToValues[i+j]) - parseInt(hitFromValues[i+j]) + 1))
                .attr('width',xScale(parseInt(hitToValues[i+j]) - parseInt(hitFromValues[i+j])));

            hitBars.append('rect')
                .attr('height',barHeight)
                .attr({'x':xScale(queryFromValues[i+j]),'y':(hitYValue + (k*widthBtnBars))})
                .attr('width',xScale(parseInt(hitToValues[i+j]) - parseInt(hitFromValues[i+j])))
                .attr('fill', 'url(#pattern' + j +')')
                .attr("id","hitRect"+(i+j))
                .attr('class', "bars")
                .attr('onclick', "clickedOnBar(evt)");

            qrySeqLength = qseq[i+j].length;
            hitSeqLength = hseq[i+j].length;
            qStart = parseInt(queryFromValues[i+j]);
            qLen = parseInt(queryToValues[i+j]);
            hStart = parseInt(hitFromValues[i+j]);
            hLen = parseInt(hitToValues[i+j]);
            queryFullLength = hLen - hStart + 1;

            hitBars.select("#hitRect"+(i+j)).style("cursor","pointer")
                .attr("alignmentInfo", "def:" + def[i+j] + "::Subject:"+ hitFromValues[i+j] + " - " + hitToValues[i+j] +
                "::Score:" +score[i+j] + "::eValue:" + eValue[i+j] + "::Identities:" + identities[i+j] + "/" + queryFullLength +
                "::Positives:" + positives[i+j] + "/" + queryFullLength + "::Gaps:" + gaps[i+j] + "/" + queryFullLength +
                "::QueryStart:"+ qStart + "::QueryEnd:"+ qLen +"::QueryLen:"+ queryFullLength + "::QuerySeq:"+qseq[i+j] +
                "::midLineSeq:"+ midLine[i+j] + "::SubStart:"+ hStart + "::SubEnd:"+ hLen + "::SubSeq:"+ hseq[i+j])
                .attr("title", "Subject co-ordinates (" + hitFromValues[i+j] + " - " + hitToValues[i+j] + ")");


            //if(xScale(parseInt(hitToValues[i+j])-25) - xScale(parseInt(hitFromValues[i+j])+2) < overlapThreshold) {
            //
            //    hitTexts.append('text')
            //        .attr({'x':xScale((parseInt(hitToValues[i+j])-25 + parseInt(hitFromValues[i+j])+2)/2),'y':(50 + (k*widthBtnBars))})
            //        .text(ellipse)
            //        .style({'fill':'#000000','font-size':'20px'})
            //        .style("cursor","pointer")
            //        .attr("id","hitEllipse"+(i+j))
            //        .attr('onclick', "clickedOnBar(evt)")
            //        .attr("alignmentInfo", "def:" + def[i+j] + "::Subject:"+ hitFromValues[i+j] + " - " + hitToValues[i+j] +
            //        "::Score:" +score[i+j] + "::eValue:" + eValue[i+j] + "::Identities:" + identities[i+j] + "/" + queryFullLength +
            //        "::Positives:" + positives[i+j] + "/" + queryFullLength + "::Gaps:" + gaps[i+j] + "/" + queryFullLength +
            //        "::QueryStart:"+ qStart + "::QueryEnd:"+ qLen +"::QueryLen:"+ queryFullLength + "::QuerySeq:"+qseq[i+j] +
            //        "::midLineSeq:"+ midLine[i+j] + "::SubStart:"+ hStart + "::SubEnd:"+ hLen + "::SubSeq:"+ hseq[i+j])
            //        .attr("title", "Subject co-ordinates (" + hitFromValues[i+j] + " - " + hitToValues[i+j] + ")");
            //} else {
            //
            //    hitTexts.append('text')
            //        .attr({'x':xScale(parseInt(hitFromValues[i+j])+2),'y':(52 + (k*widthBtnBars))})
            //        .text(hitFromValues[i+j])
            //        .style({'fill':'#000000','font-size':'10px'})
            //        .attr("id","hitFromText"+(i+j));
            //
            //    hitTexts.append('text')
            //        .attr({'x':xScale(parseInt(hitToValues[i+j])-25),'y':(52 + (k*widthBtnBars))})
            //        .text(hitToValues[i+j])
            //        .style({'fill':'#000000','font-size':'10px'})
            //        .attr("id","hitToText"+(i+j));
            //}



            //hStart = hStart -1;
            //Add gaps only if there is consecutive 3 gaps
            addHitGaps(gaps, (i+j), hseq, hitBars, xScale, k, qStart, hStart);
        }

        if(numOfRegionsLeft[i] > 1) {
            i = i+numOfRegionsLeft[i];
        } else {
            i++;
        }
    }
}

//Add gaps only if there is consecutive 3 gaps
function addHitGaps(gaps, i, sequ, bars, xScale, k, qStart, hStart) {

    hStart = hStart -1;
    var gapsInHit = 0;
    var diffValue=0;
    if(gaps[i] > 2) {
        if(qStart > hStart) {
            diffValue = qStart - hStart;
        }
        var allGapsInQuery = getAllIndexes(sequ[i], "-");

        for(var l= 0; l<allGapsInQuery.length;) {
            var x=0;
            var initialValue = allGapsInQuery[l];
            while((allGapsInQuery[l]+1) == allGapsInQuery[l+1]) {
                x++;
                l++;
            }
            gapsInHit = gapsInHit + x;
            if(x>1) {

                bars.append('rect')
                    .attr('height',barHeight)
                    .style("z-index", "20")
                    .attr({'x':xScale(parseInt(qStart + initialValue - gapsInHit)),'y':(hitYValue + (k*widthBtnBars))})
                    .style('fill',gapColor)
                    .attr('width',xScale(parseInt(initialValue+x) - initialValue))
                    .attr("id","hitRectGapBackground"+i+l);

                bars.select("#hitRectGapBackground"+i+l).style("cursor","pointer").attr("title","Subject Gap ["+ (hStart + parseInt(initialValue)) + " - " + (hStart + parseInt(initialValue+x)) + "]");

                bars.append('rect')
                    .attr('height',2)
                    .style("z-index", "20")
                    .attr({'x':xScale(parseInt(qStart + initialValue - gapsInHit)),'y':(hitGapLineYValue + (k*widthBtnBars))})
                    .style('fill',gapLineColor)
                    .attr('width',xScale(parseInt(initialValue+x) - initialValue))
                    .attr("id","hitRectGap"+i+l);

                bars.select("#hitRectGap"+i+l).style("cursor","pointer").attr("title","Subject Gap ["+ (hStart + parseInt(initialValue)) + " - " + (hStart + parseInt(initialValue+x)) + "]");
            }
            l++;
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
        .attr('width', 4)
        .attr('height', 4)
        .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('stroke', firstPatternColor)
        .attr('stroke-width', 1);

    canvas.append('defs')
        .append('pattern')
        .attr('id', 'pattern2')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 2)
        .attr('height', 3)
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

//Get all the occurrences of the val ('-' hyphen sign) in the sequence
function getAllIndexes(sequence, val) {
    var indexes = [], i = -1;
    while ((i = sequence.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}

