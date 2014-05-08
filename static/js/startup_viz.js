// Crunchbase API user_key=869f06a05467daf39f364b88f2e6cebb for user 'rochitg'

// random Crunchbase api_key from online:mgxpds8ja7f6cncwd39caed7 

// Crunchbase api_key from PJ:ndcq6rwvpenbagu7p9rkxpw6

// LinkedIn API
// API Key:75vz3losta7h1f

// Secret Key:V9sLwHsjIP98AExS

//OAuth User Token:a385d2fb-c830-4973-99cb-933d8586a4ec

//OAuth User Secret:b07e0c4d-0db4-4992-8850-374affa3ee5a

var urlList = ["http://api.crunchbase.com/v/1/company/dropbox.js?api_key=ndcq6rwvpenbagu7p9rkxpw6&callback=?","http://api.crunchbase.com/v/1/company/facebook.js?api_key=ndcq6rwvpenbagu7p9rkxpw6&callback=?","http://api.crunchbase.com/v/1/company/microsoft.js?api_key=ndcq6rwvpenbagu7p9rkxpw6&callback=?","http://api.crunchbase.com/v/1/company/box.js?api_key=ndcq6rwvpenbagu7p9rkxpw6&callback=?"];
var jsonList = [];
var relevanceArray = [95, 50, 75, 5];

$(document).ready(function() {

	$("#results_container").hide();

	// render results table when user hits 'Enter' in searchbar
	$("#keyword_search_bar").keypress(function(e) {
		if (e.keyCode == 13) {
			handleSearchTerms();
			showResults();
		}
	});

	// render results table when user clicks on button
	$("#search_button").click(function() {
		handleSearchTerms();
		showResults();
	}); 
});

var showResults = function() {
	// add code to reset results_container before rendering new results table

	$("#results_container").show();

	for (var i = 0; i < urlList.length; i++) {
		getCompanyData(tempFunc, i);
	}	
}

var getCompanyData = function(callback, index) {	
	$.ajax({
		url: urlList[index],
		dataType: 'json',
		async: false,
		success: function(data) {
			jsonList.push(data);
			callback(data);
		}
	});
};

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

var parseCompanyData = function(currCompany) {
	//console.log("inside parseCompanyData()");

	if (typeof(currCompany) != 'undefined' && currCompany != null) {

		//console.log(currCompany);

		var logoURL = currCompany.image.available_sizes[0][1];
		var logoHeight = currCompany.image.available_sizes[0][0][0];
		var logoWidth = currCompany.image.available_sizes[0][0][1];
		var name = currCompany.name;

		var relevance = currCompany.relevance; // get this from ML output
		i++;

		var yearFounded = currCompany.founded_year;
		var totalFunding = currCompany.total_money_raised;
		var status = currCompany.ipo;
		if (typeof(status) != 'undefined' && status != null) {
			status = "IPO";
		} else {
			status = "Operating";
		}

		var country = currCompany.offices[0].country_code;
		var state = currCompany.offices[0].state_code;
		var location = null;
		if (typeof(state) != 'undefined' && state != null) {
			location = state + ', ' + country;
		} else {
			location = country;
		}

		var permalink = currCompany.permalink; // use this as id of row

		var colorScale = d3.scale.linear().domain([0,100]).interpolate(d3.interpolateHsl).range(["#FF0000","#3CF057"]);
		var sizeScale = d3.scale.linear().domain([0,100]).range([0,94]);
		var relevanceColor = colorScale(relevance);
		var barSize = Math.floor(sizeScale(relevance));

		var defaultRelevanceBar = "<rect x=\"2\" y=\"32\" width=\"94px\" height=\"20px\" style=\"fill:#E8E8E8;stroke-width:0;stroke:rgb(0,0,0)\"/>";
		var relevanceBar = "<rect x=\"2\" y=\"32\" width=\"" + barSize + "px\" height=\"20px\" style=\"fill:" + relevanceColor + ";stroke-width:0;stroke:rgb(0,0,0)\"/>";
		var relevanceContainer = "<svg width=\"100px\" height=\"80px\">" + defaultRelevanceBar + relevanceBar + "</svg>";
		
		var table = d3.select("#results_table");

		// create row with filled in data to append to table
		var logoString = "<img src='" + logoURL + "' height='" + logoWidth + "px' width='" + logoHeight+ "px'>";

		//var infoList = [logoString, name, relevanceContainer, yearFounded, totalFunding, status, location];

		var htmlString = "<td class=\"logo\">" + logoString + "</td><td>" + name + "</td><td class=\"relevance\">" + relevanceContainer + "</td><td>" + yearFounded + "</td><td>" + totalFunding + "</td><td>" + status + "</td><td>" + location + "</td>";

		// append row to table
		table.append("tr").attr("class", "results_table_row").attr("id", permalink).html(htmlString);

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
	//console.log("about to make ajax request");
	$.ajax({
		url: url,
		dataType: 'json',
		async: false,
		success: function(data) {
			callback(data);
		}
	});
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
	logoBox.append("img").attr("src", logoURL).attr("height", logoWidth + "px").attr("width", logoHeight + "px")
		.attr("max-width", "160px").attr("max-height", "90px").style("padding-top", ((90 - logoWidth) / 2) + "px");

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
	var country = resp.offices[0].country_code;
	var state = resp.offices[0].state_code;
	var location = null;
	if (typeof(state) != 'undefined' && state != null) {
		location = state + ', ' + country;
	} else {
		location = country;
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


	modalHeader.append("div").attr("class","results_modal_button").attr("id","results_modal_url_button")
		.style("left","825px").style("top", "39px").append("p").text("Homepage");
	$("#results_modal_url_button").click(function() {
		window.open(resp.homepage_url);
	});

	
	modalHeader.append("div").attr("class","results_modal_button").attr("id","results_modal_crunchbase_button")
		.style("left","825px").style("top", "72px").append("p").text("Crunchbase");
	$("#results_modal_crunchbase_button").click(function() {
		window.open(resp.crunchbase_url);
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
				investorList.append("li").append("a").attr("href", str).text(txt);			
			} else if (investor.person != null) {
				var str = "http://www.crunchbase.com/organization/" + investor.person.permalink;
				var txt = investor.person.name;
				investorList.append("li").append("a").attr("href", str).text(txt);	
			} else if (investor.financial_org != null) {
				var str = "http://www.crunchbase.com/organization/" + investor.financial_org.permalink;
				var txt = investor.financial_org.name;
				investorList.append("li").append("a").attr("href", str).text(txt);	
			}
		}
	}
	
	//console.log(fundingList);
	// keep necessary data from fundingList and convert dates to quarters
	var o = d3.scale.ordinal().domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).range([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4]);
	var trimmedFundingList = [];
	for (var k = 0; k < fundingList.length; k++) {
		var currElement = fundingList[k];
		console.log(currElement);
		var currQuarter = o(currElement.funded_month);
		var tempObj = {
			funded_year: currElement.funded_year,
			funded_quarter: currQuarter,
			raised_amount: currElement.raised_amount
		};
		trimmedFundingList.push(tempObj);
	}


	// create wrapper for quarterly funding line graph
	modalContent.append("div").attr("id", "results_modal_graph_container");
	// dimensions : width: 650px; height: 368px;
	var m = [80, 80, 80, 80]; // margins
	var w = 650 - m[1] - m[3];
	var h = 368 - m[2] - m[4];

	


	// set up functionality for close button
	$("#close_modal").click(function() {
		$("#results_modal_container").hide();
		$("#overlay").hide();
	});

};

var dateToQuarter = function(month, year) {

}

var handleSearchTerms = function() {
	searchTermStr = $("#keyword_search_bar").val();
	//console.log(searchTermStr);
	var dataToSend = {
		restQuery: searchTermStr
	};

	// PJ: This is where the call to retrieve the data from the API should be
	// Both of the below are doing the same thing, I just split them up to see
	// if there was anything I was missing. I tried adding the '?callback=?'
	// part to try to get around the CORS stuff.

	/*
	$.ajax({
		dataType: "jsonp",
		url: "http://startup-search.herokuapp.com/search2/?callback=?",
		data: dataToSend,
		success: function(data) {
			console.log("ajax request done");
			console.log(data);
		}
	});
	*/

	/*
	$.getJSON("http://startup-search.herokuapp.com/search2?callback=?", dataToSend, function(data) {
		console.log("ajax request done");
		console.log(data);
	});
	*/

	//console.log("end of handleSearchTerms()");
};



