// Crunchbase API user_key=869f06a05467daf39f364b88f2e6cebb for user 'rochitg'

// random Crunchbase api_key from online:mgxpds8ja7f6cncwd39caed7 

// Crunchbase api_key from PJ:ndcq6rwvpenbagu7p9rkxpw6

// LinkedIn API
// API Key:75vz3losta7h1f

// Secret Key:V9sLwHsjIP98AExS

//OAuth User Token:a385d2fb-c830-4973-99cb-933d8586a4ec

//OAuth User Secret:b07e0c4d-0db4-4992-8850-374affa3ee5a

var urlList = ["http://api.crunchbase.com/v/1/company/dropbox.js?api_key=ndcq6rwvpenbagu7p9rkxpw6&callback=?","http://api.crunchbase.com/v/1/company/facebook.js?api_key=ndcq6rwvpenbagu7p9rkxpw6&callback=?","http://api.crunchbase.com/v/1/company/microsoft.js?api_key=ndcq6rwvpenbagu7p9rkxpw6&callback=?","http://api.crunchbase.com/v/1/company/box.js?api_key=ndcq6rwvpenbagu7p9rkxpw6&callback=?", "http://api.crunchbase.com/v/1/company/splunk.js?api_key=ndcq6rwvpenbagu7p9rkxpw6&callback=?"];
var jsonList = [];
var relevanceArray = [95, 50, 75, 5, 25];

$(document).ready(function() {

	$("#results_container").hide();

	// render results table when user hits 'Enter' in searchbar
	$("#keyword_search_bar").keypress(function(e) {
		if (e.keyCode == 13) {
			handleSearchTerms(); // V2
			//showResults(); // V1
		}
	});

	// set up functionality for 'esc' key
	$(document).keyup(function(e) {
		if (e.keyCode == 27) {
			$("#results_modal_container").hide();
			$("#overlay").hide();
		}
	});		

	// render results table when user clicks on button
	$("#search_button").click(function() {
		handleSearchTerms(); // V2
		//showResults(); // V1
	}); 
});

// V1
var showResults = function() {
	// add code to reset results_container before rendering new results table

	$("#results_container").show();

	for (var i = 0; i < urlList.length; i++) {
		getCompanyData(tempFunc, i);
	}	
}

// V1
var getCompanyData = function(callback, index) {	
	$.ajax({
		url: urlList[index],
		dataType: 'json',
		async: false,
		success: function(data) {
			console.log("Crunchbase API response:");
			console.log(data);
			//jsonList.push(data);
			//callback(data);
		}
	});
};

// V1
var tempFunc = function(resp) {
	//console.log("got to tempFunc");
	//console.log("URL list length: " + urlList.length);
	//console.log("JSON list length: " + jsonList.length);
	if (urlList.length != jsonList.length) {
		//console.log("about to return");
		return;
	}

	// TODO: Remove this later - only here for testing purposes
	for (var k = 0; k < jsonList.length; k++) {
		jsonList[k]["relevance"] = relevanceArray[k];
	}

	tempList = sortCompaniesByRelevance(jsonList);

	for (var j = 0; j < jsonList.length; j++) {
		parseCompanyData(tempList[j]);
	}	
}

var sortCompaniesByRelevance = function(companyList) {
	return companyList.sort(function(x,y){
		return y.relevance - x.relevance;
	});
};

var i = 0;
var lastClicked = null;
var counter = 0;

// V1 and V2
var parseCompanyData = function(currCompany) {
	//console.log("inside parseCompanyData()");

	if (typeof(currCompany) != 'undefined' && currCompany != null) {

		//var logoURL = currCompany.image.available_sizes[0][1]; // V1
		var logoURL = currCompany.image; // V2
		//var logoHeight = currCompany.image.available_sizes[0][0][0]; // V1
		var logoHeight = currCompany.logoWidth; // V2
		//var logoWidth = currCompany.image.available_sizes[0][0][1]; // V1
		var logoWidth = currCompany.logoHeight; // V2

		var name = currCompany.name; // V1 and V2

		var relevance = currCompany.relevance; // V1 and V2
		i++;

		//var yearFounded = currCompany.founded_year; // V1
		var yearFounded = 0000; // V2
		//var totalFunding = currCompany.total_money_raised; // V1
		var totalFunding = "$0M"; // V2
		//var status = currCompany.ipo; // V1
		var status = "?????"; // V2
		/*
		if (typeof(status) != 'undefined' && status != null) {
			status = "IPO";
		} else {
			status = "Operating";
		}
		*/
		//var country = currCompany.offices[0].country_code; // V1
		var country = currCompany.country; // V2
		//var state = currCompany.offices[0].state_code; // V1
		var state = currCompany.state; // V2
		var location = null; // V1 and V2
		if (country == null) {
			location = "Unknown";
		} else if (state != null) {
			location = state + ', ' + country;
		} else {
			location = country;
		}

		var permalink = currCompany.permalink; // use this as id of row // V1
		//var permalink = "dropbox" + counter; // V2
		//counter = counter + 1; // V2

		//console.log("done setting up everything up until permalink");

		var colorScale = d3.scale.linear().domain([0,100]).interpolate(d3.interpolateHsl).range(["#FF0000","#3CF057"]);
		var sizeScale = d3.scale.linear().domain([0,100]).range([1,94]);
		var relevanceColor = colorScale(relevance);
		var barSize = Math.floor(sizeScale(relevance));

		var defaultRelevanceBar = "<rect x=\"2\" y=\"32\" width=\"94px\" height=\"20px\" style=\"fill:#E8E8E8;stroke-width:0;stroke:rgb(0,0,0)\"/>";
		var relevanceBar = "<rect x=\"2\" y=\"32\" width=\"" + barSize + "px\" height=\"20px\" style=\"fill:" + relevanceColor + ";stroke-width:0;stroke:rgb(0,0,0)\"/>";
		var relevanceContainer = "<svg width=\"100px\" height=\"80px\">" + defaultRelevanceBar + relevanceBar + "</svg>";
		
		var table = d3.select("#results_table");

		// create row with filled in data to append to table
		var logoString = "<img src='" + logoURL + "' height='" + logoWidth + "px' width='" + logoHeight+ "px'>";

		//var infoList = [logoString, name, relevanceContainer, yearFounded, totalFunding, status, location];

		//var htmlString = "<td class=\"logo\">" + logoString + "</td><td>" + name + "</td><td class=\"relevance\">" + relevanceContainer + "</td><td>" + yearFounded + "</td><td>" + totalFunding + "</td><td>" + status + "</td><td>" + location + "</td>";
		var htmlString = "<td class=\"logo\">" + logoString + "</td><td>" + name + "</td><td class=\"relevance\">" + relevanceContainer + "</td><td>" + location + "</td>";

		// append row to table
		//console.log(permalink);
		table.append("tr").attr("class", "results_table_row").attr("id", permalink).html(htmlString);

		$(".results_table_row").hover(function(){
			$(this).css('background-color', "#A8D4FF");
		}, function(){
			$(this).css('background-color', "#F6F7F8");
		});

		//console.log(htmlString);
		//;

		//.html(htmlString);
		//var permalinkString = "#" + permalink;
		//console.log(permalinkString);
		//var currRow = d3.select(permalinkString).html("<h1>WHY OH WHY</h1>");
		//console.log(table);

		//console.log("htmlString:");
		//console.log(htmlString);
		//console.log(permalink);
		//console.log("done setting up everything up");

		/* 
		* Now that table exists, add interactivity and modals.
		* This is the 2nd main execution loop.
		*/
		
		// need the .unbind('click') because for some reason each row has 4 events bound to it instead of 1
		$(".results_table_row").unbind('click').click(function(e) {
			var currId = $(this).attr("id");
			if (lastClicked != null && lastClicked == currId) {
				//console.log("I clicked the same row as last time");
				$("#results_modal_container").show();
				$("#overlay").show();
				return; // same as last row, show same results
			} 
			// normal logic of generating modal
			lastClicked = currId; // update clicked row for next time
			//console.log(currId);

			searchUrl = "http://api.crunchbase.com/v/1/company/" + currId + ".js?api_key=ndcq6rwvpenbagu7p9rkxpw6&callback=?";
			//console.log(searchUrl);
			getAllCompanyData(getAllCompanyDataHelper, searchUrl)

		});
		
	}
};

var getAllCompanyData = function(callback, url) {
	console.log("beginning of getAllCompanyData()");
	$.ajax({
		url: url,
		dataType: 'json',
		async: false,
		success: function(data) {
			console.log("done with ajax request in getAllCompanyData()");
			callback(data);
		}
	});
	console.log("end of getAllCompanyData()");
};

var getAllCompanyDataHelper = function(resp) {

	//console.log("I GOT HERE!!!");
	//console.log(resp);

	// clear last modal
	d3.select("#results_modal_container").remove();
	d3.select("#overlay").remove();
	
	// create modal
	var parentContainer = d3.select("#results_container");

	// create gray background overlay
	parentContainer.append("div").attr("id", "overlay");

	// create wrapper for modal window
	parentContainer.append("div").attr("id", "results_modal_container")
		.append("div").attr("id", "results_modal_content");

	var modalContent = d3.select("#results_modal_content");

	// create close button
	modalContent.append("div").attr("id","close_modal_container")
		.append("i").attr("class", "icon-cancel-circled").attr("id", "close_modal");

	// create overview container
	modalContent.append("div").attr("id","results_modal_overview_container").style("display","none");

	// begin - create modal header
	modalContent.append("div").attr("id", "results_modal_header");
	var modalHeader = d3.select("#results_modal_header");

	modalHeader.append("div").attr("id","results_modal_logo"); // wrapper for company logo

	// fill in company logo
	var logoURL = resp.image.available_sizes[0][1];
	var logoHeight = resp.image.available_sizes[0][0][0];
	var logoWidth = resp.image.available_sizes[0][0][1];	

	//var logoString = "<img src='" + logoURL + "' height='" + logoWidth + "px' width='" + logoHeight+ "px'>";
	var logoBox = d3.select("#results_modal_logo");
	// logoBox dimensions: height=90px, width=160px
	logoBox.attr("max-height", "90px").attr("max-width", "160px");
	
	//logoBox.append("img").attr("src", logoURL).attr("height", logoWidth + "px").attr("width", logoHeight + "px")
		//.attr("max-width", "160px").attr("max-height", "90px");
	logoBox.append("img").attr("class", "resize_fit_center").attr("src", logoURL);
		//.attr("max-height", "90px");
		//.style("padding-top", ((90 - logoWidth) / 2) + "px");
	
	/*
	logoBox.append("img").style("background-image", "url(" + logoURL + ")").style("background-repeat", "no-repeat")
		.style("background-size", "contain").style("position", "absolute").style("left", "0").style("top", "0");
		//.attr("max-width", "100%").attr("max-height", "100%").style("padding-top", ((90 - logoWidth) / 2) + "px");
	*/
	modalHeader.append("div").attr("id","results_modal_profile"); // wrapper for company info

	d3.select("#results_modal_profile").append("ul")
		.attr("id", "results_modal_profile_list").style("list-style-type", "none").style("padding-left", "10px");

	var modalProfileList = d3.select("#results_modal_profile_list");

	// fill in company name
	var tempString = "<span style=\"color: #ABABAB\">Name: </span>" + resp.name;
	modalProfileList.append("li").style("margin", "0px 0px 11px 0px").html(tempString);

	// fill in company status
	var status = resp.ipo;
	if (typeof(status) != 'undefined' && status != null) {
		status = "IPO";
	} else {
		status = "Operating";
	}
	tempString = "<span style=\"color: #ABABAB\">Status: </span>" + status;
	modalProfileList.append("li").style("margin", "11px 0px 11px 0px").html(tempString);

	// fill in company location
	//var country = "";
	//var state = "";
	var location = "";
	if (resp.offices.length > 0) {
		var office = resp.offices[0];
		if (office.country_code != null) {
			if (office.state_code != null) {
				location = office.state_code + ', ' + office.country_code;
			} else {
				location = office.country_code;
			}
		} else {
			location = "Unknown";
		}
	} else {
		location = "Unknown";
	}

	tempString = "<span style=\"color: #ABABAB\">Location: </span>" + location;
	modalProfileList.append("li").style("margin", "11px 0px 0px 0px").html(tempString);

	// fill in company overview
	var modalOverviewContainer = d3.select("#results_modal_overview_container");
	modalOverviewContainer.append("div").html(resp.overview);

	$("#results_modal_overview_container").click(function(e) {
		e.preventDefault();
	});

	// create buttons
	modalHeader.append("div").attr("class","results_modal_button").attr("id","results_modal_overview_button")
		.style("left","825px").style("top", "5px").append("p").text("Overview");
	$("#results_modal_overview_button").click(function() {
		$("#results_modal_overview_container").toggle();
	});
	$("#results_modal_overview_button").hover(function(){
		$(this).css('background-color', "#A8D4FF");
	}, function(){
		$(this).css('background-color', "#F6F7F8");
	});	


	modalHeader.append("div").attr("class","results_modal_button").attr("id","results_modal_url_button")
		.style("left","825px").style("top", "39px").append("p").text("Homepage");
	$("#results_modal_url_button").click(function() {
		window.open(resp.homepage_url);
	});
	$("#results_modal_url_button").hover(function(){
		$(this).css('background-color', "#A8D4FF");
	}, function(){
		$(this).css('background-color', "#F6F7F8");
	});	
	
	modalHeader.append("div").attr("class","results_modal_button").attr("id","results_modal_crunchbase_button")
		.style("left","825px").style("top", "72px").append("p").text("Crunchbase");
	$("#results_modal_crunchbase_button").click(function() {
		window.open(resp.crunchbase_url);
	});
	$("#results_modal_crunchbase_button").hover(function(){
		$(this).css('background-color', "#A8D4FF");
	}, function(){
		$(this).css('background-color', "#F6F7F8");
	});	

	// end - created modal header

	// create wrapper for company finance data
	modalContent.append("div").attr("id", "results_modal_finance_data");
	var financeContainer = d3.select("#results_modal_finance_data");

	// fill in finance title
	financeContainer.append("div").attr("id", "results_modal_finance_title").html("<h2>Funding Summary</h2>");
	
	// fill in total funding information
	tempString = "<span style=\"color: #ABABAB\">Total Funding: </span>" + resp.total_money_raised;
	financeContainer.append("div").attr("id", "results_modal_finance_total_funding").html(tempString);
	
	// fill in current funding round
	tempString = "<span style=\"color: #ABABAB\">Current Funding Round: </span>" + resp.funding_rounds.length;
	financeContainer.append("div").attr("id", "results_modal_finance_funding_round").html(tempString);

	// fill in investor title
	tempString = "<span style=\"color: #ABABAB\">Investors: </span>";
	financeContainer.append("div").attr("id", "results_modal_investor_title").html(tempString);

	// fill in list of investors
	financeContainer.append("div").attr("id", "results_modal_investor_container").append("ul").attr("id","results_modal_investor_list")
		.style("list-style-type", "none").style("padding-left", "10px");	

	var finalStr = "";
	var investorList = d3.select("#results_modal_investor_list");
	var fundingList = resp.funding_rounds;

	for (var j = 0; j < resp.funding_rounds.length; j++) {
		var investmentsArr = resp.funding_rounds[j].investments;

		for (var k = 0; k < investmentsArr.length; k++) {
			var investor = investmentsArr[k];
			if (investor.company != null) {
				var str = "http://www.crunchbase.com/organization/" + investor.company.permalink;
				var txt = investor.company.name;
				investorList.append("li").append("a").attr("href", str).attr("target", "blank").text(txt);
			} else if (investor.organization != null) {
				var str = "http://www.crunchbase.com/organization/" + investor.organization.permalink;
				var txt = investor.organization.name;	
				investorList.append("li").append("a").attr("href", str).attr("target", "blank").text(txt);			
			} else if (investor.person != null) {
				var str = "http://www.crunchbase.com/organization/" + investor.person.permalink;
				var txt = investor.person.name;
				investorList.append("li").append("a").attr("href", str).attr("target", "blank").text(txt);	
			} else if (investor.financial_org != null) {
				var str = "http://www.crunchbase.com/organization/" + investor.financial_org.permalink;
				var txt = investor.financial_org.name;
				investorList.append("li").append("a").attr("href", str).attr("target", "blank").text(txt);	
			}
		}
	}
	
	// keep necessary data from fundingList and convert dates to quarters
	var o = d3.scale.ordinal().domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).range([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
	var trimmedFundingList = [];
	for (var k = 0; k < fundingList.length; k++) {
		var currElement = fundingList[k];
		//console.log(currElement);
		var currQuarter = o(currElement.funded_month);
		var currAmount = currElement.raised_amount;
		if (currAmount == null) {
			currAmount = 0;
		}
		var tempObj = {
			funded_year: currElement.funded_year,
			funded_quarter: currQuarter,
			raised_amount: currAmount,
		};
		trimmedFundingList.push(tempObj);
	}

	//console.log("trimmedFundingList:");
	//console.log(trimmedFundingList);

	var startQuarter = [0, 0];
	var endQuarter = [0, 0];
	if (trimmedFundingList.length > 0) {
		startQuarter = [trimmedFundingList[0].funded_quarter, trimmedFundingList[0].funded_year];
		endQuarter = [trimmedFundingList[trimmedFundingList.length-1].funded_quarter, trimmedFundingList[trimmedFundingList.length-1].funded_year];
	}

	// create dataArr for each quarter
	//var startQuarter = [trimmedFundingList[0].funded_quarter, trimmedFundingList[0].funded_year];
	//var endQuarter = [trimmedFundingList[trimmedFundingList.length-1].funded_quarter, trimmedFundingList[trimmedFundingList.length-1].funded_year];
	
	//console.log("startQuarter: " + startQuarter);
	//console.log("endQuarter: " + endQuarter);

	var allQuartersList = [];
	var previousAmount = 0;
	var index = 0; // to step through trimmedFundingList

	for (var year = startQuarter[1]; year <= endQuarter[1]; year++) {
		for (var quar = 1; quar <= 4; quar++) {
			if (year == startQuarter[1] && quar < startQuarter[0]) {
				//console.log("year: " + year);
				//console.log("quar: " + quar);
				continue;
			}
			else if (year == endQuarter[1] && quar > endQuarter[0]) {
				break;
			}

			if (year == trimmedFundingList[index].funded_year && quar == trimmedFundingList[index].funded_quarter) {
				// means got funding this round
				//allQuartersList.push(trimmedFundingList[index]);
				
				var amount = previousAmount + trimmedFundingList[index].raised_amount;
				//var amount = previousAmount;
				var obj = {
					funded_year: year,
					funded_quarter: quar,
					raised_total: amount
				}
				allQuartersList.push(obj);
				//previousAmount = previousAmount + trimmedFundingList[index].raised_amount;
				previousAmount = amount;

				// advance for next time
				index = index + 1;
			} else { // no funding this time, keep same raised_amount
				var amount = previousAmount;
				var obj = {
					funded_year: year,
					funded_quarter: quar,
					raised_total: amount
				};
				allQuartersList.push(obj);
			}
		}
	}



	// create wrapper for quarterly funding line graph
	modalContent.append("div").attr("id", "results_modal_graph_container");

	var graphContainer = d3.select("#results_modal_graph_container");

	// set up graph title 
	graphContainer.append("div").attr("id","results_modal_graph_title").append("h2").text("Total Funding Over Time (Quarterly)");
	
	// dimensions : width: 650px; height: 368px;
	var m = [80, 80, 80, 80]; // margins
	//var w = 650 - m[1] - m[3];
	var w = 490;
	//var h = 368 - m[2] - m[4];
	//var h1 = 368 - m[2] - m[4];
	var h = 208;

	var data = allQuartersList;

	// X scale will fit all values from data[] within pixels 0-w
	var scaleX = d3.scale.linear().domain([0, data.length]).range([0, w]);

	// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
	var maxRaised = 0;
	if (allQuartersList.length > 0) {
		maxRaised = allQuartersList[allQuartersList.length-1].raised_total;
	}
	//var maxRaised = allQuartersList[allQuartersList.length-1].raised_total;
	/*
	console.log("maxRaised: " + maxRaised);
	console.log("h1: " + h1);
	console.log(typeof(h1));
	console.log("w: " + w);
	console.log(typeof(w));
	*/

	//console.log(typeof(maxRaised));
	//var scaleY = d3.scale.linear().domain([0, maxRaised]).range([h, 0]);

	//1107200000
	//1000000000000
	//var linearScale = d3.scale.linear().domain([0,1107200000]).range([208,0]);
	var linearScale = d3.scale.linear().domain([0,maxRaised]).range([h,0]);
	//console.log("linearScale(0): " + linearScale(0));
	//console.log("linearScale(900): " + linearScale(900));

	//console.log("scaleY(0): " + scaleY(0));
	//console.log("scaleY(110720000): " + scaleY(110720000));

	// create a line function that can convert data[] into x and y points
	var line = d3.svg.line()
		// assign the X function to plot our line as we wish
		.x(function(d,i) { 
			//console.log("in x:");
			// verbose logging to show what's actually being done
			//console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + scaleX(i) + ' using our xScale.');
			// return the X coordinate where we want to plot this datapoint
			return scaleX(i); 
		})
		.y(function(d) { 
			//console.log("in y:");
			var raisedMoney = d.raised_total;
			//console.log(raisedMoney);
			//console.log(typeof(raisedMoney));			
			// verbose logging to show what's actually being done
			//console.log('Plotting Y value for data point: ' + raisedMoney + ' to be at: ' + linearScale(raisedMoney) + " using our yScale.");
			// return the Y coordinate where we want to plot this datapoint
			return linearScale(raisedMoney);
		});

	
	// Add an SVG element with the desired dimensions and margin.
	var graph = d3.select("#results_modal_graph_container");

	// add SVG graph (canvas) container for line graph
	graph.append("svg:svg")
		.attr("width", "620px")
		.attr("height", "330px")
		.attr("id", "svg_canvas")
		.style("position", "absolute")
		.style("top", "19px")
		.style("left", "15px")
		.style("border", "1px solid black");

	// add SVG graph in coordinate space
	var svgCanvas = d3.select("#svg_canvas");
	svgCanvas.append("svg:g")
		.attr("id", "graph_group")
	    .attr("x", "200")
	    .attr("y", "200")
	    .attr("transform", "translate(" + 120 + "," + 75 + ")");
	  	
	var ticksArr = $.map(allQuartersList, function(data, index) {
		//console.log(data);
		var toReturn = " ";
		if (data.funded_quarter == 1) {
			var currYear = data.funded_year;
			toReturn = "'" + data.funded_year.toString().substring(2);	
			return toReturn;
		} 
		return toReturn;
	});


	var rangeArr = [];
	for (var l = 0; l < allQuartersList.length; l++) {
		rangeArr.push(scaleX(l));
	}


	// change above to use ordinal scale
	var xTickScale = d3.scale.ordinal().rangeRoundBands([0, w]);
	// create x-axis
	var xAxis = d3.svg.axis().scale(xTickScale).orient("bottom").ticks(allQuartersList.length).tickSubdivide(true).tickSize(-h);
	xTickScale.domain(ticksArr);

	// TODO: set up ticks correctly



	var group = d3.select("#graph_group");

	// TODO: label x-axis

	// Add the x-axis.
	group.append("svg:g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + h + ")")
	    .attr("x", "200")
	    .attr("y", "200")
	    .call(xAxis);	



	// create left yAxis
	var yAxisLeft = d3.svg.axis().scale(linearScale).ticks(4).orient("left").tickFormat(function(d) {
		var toReturn = "$" + d;
		toReturn = toReturn.substring(0, toReturn.length-6);
		toReturn = toReturn + "M";
		return toReturn;
	}).tickSize(-w);

	// Add the y-axis to the left
	group.append("svg:g")
	      .attr("class", "y axis")
	      .attr("transform", "translate(-5,0)")
	      .call(yAxisLeft);

	// Add the line by appending an svg:path element with the data line we created above
	// do this AFTER the axes above so that the line is above the tick-lines
	group.append("svg:path").attr("d", line(data));
	
	
	
	
	// set up functionality for close button
	$("#close_modal").click(function() {
		$("#results_modal_container").hide();
		$("#overlay").hide();
		$(this).unbind();
	});

};

var handleSearchTerms = function() {
	searchTermStr = $("#keyword_search_bar").val();
	console.log(searchTermStr);
	var dataToSend = {
		restQuery: searchTermStr
	};
	handleSearchTermsHelper(tempFunc2, dataToSend);
};

var tempFunc2 = function(resp) {
	//console.log("in tempFunc2()");
	//console.log(resp);

	for (var j = 0; j < resp.length; j++) {
		parseCompanyData(resp[j]);
	}	
};

var handleSearchTermsHelper = function(callback, dataObject) {
	//console.log("doin ajax work")
	$("#results_container").show();

	$.ajax({
		type: "POST",
		dataType: "json",
		//url: "http://startup-search.herokuapp.com/searchAPI",
		url: "http://localhost:5000/searchAPI",
		data: dataObject,
		success: function(data) {
			//console.log("ajax request done");
			console.log("Our API response:");
			console.log(data);
			callback(data);
		}
	});
	//console.log("DONE with ajax work")
};



