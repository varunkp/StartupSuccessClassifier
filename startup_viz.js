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

	d3.selectAll("a").style("color","green");

	var compRelevData = [["A",15],["B",3],["C",7],["D",19],["E",12]];

	$("#search_button").click(function() {
		$("#results_container").show();

		for (var i = 0; i < urlList.length; i++) {
			getCompanyData(tempFunc, i);
		}
	}); 
});

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

	console.log("made it past the length check");
	console.log(resp);

	// TODO: Remove this later - only here for testing purposes
	for (var k = 0; k < jsonList.length; k++) {
		jsonList[k]["relevance"] = relevanceArray[k];
	}

	console.log(jsonList);
	tempList = sortCompaniesByRelevance(jsonList);
	console.log(tempList);	

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

var parseCompanyData = function(currCompany) {
	console.log("inside parseCompanyData()");
	if (typeof(currCompany) != 'undefined' && currCompany != null) {
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
		var location;
		if (typeof(state) != 'undefined' && state != null) {
			location = state + ', ' + country;
		} else {
			location = country;
		}

		var colorScale = d3.scale.linear().domain([0,100]).interpolate(d3.interpolateHsl).range(["#FF0000","#3CF057"]);
		var sizeScale = d3.scale.linear().domain([0,100]).range([0,94]);
		var relevanceColor = colorScale(relevance);
		var barSize = Math.floor(sizeScale(relevance));

		var defaultRelevanceBar = "<rect x=\"1\" y=\"49\" width=\"94px\" height=\"20px\" style=\"fill:#E8E8E8;stroke-width:0;stroke:rgb(0,0,0)\"/>";
		var relevanceBar = "<rect x=\"1\" y=\"49\" width=\"" + barSize + "px\" height=\"20px\" style=\"fill:" + relevanceColor + ";stroke-width:0;stroke:rgb(0,0,0)\"/>";
		var relevanceContainer = "<svg width=\"100px\" height=\"110px\">" + defaultRelevanceBar + relevanceBar + "</svg>";
		

		table = d3.select("#results_table");
		// create row with filled in data to append to table
		logoString = "<img src='" + logoURL + "' alt='Smiley face' height='" + logoWidth + "px' width='" + logoHeight+ "px'>";
		htmlString = "<td>" + logoString + "</td><td>" + name + "</td><td class=\"relevance\">" + relevanceContainer + "</td><td>" + yearFounded + "</td><td>" + totalFunding + "</td><td>" + status + "</td><td>" + location + "</td>";
		// append row to table
		table.append("tr").attr("class", "results_table_row").html(htmlString);
		
	}
};

var handleSearchTerms = function() {
	searchTermArr = $("#keyword_search_bar").val().split(",");
	for (i = 0; i < searchTermArr.length; i++) {
		console.log(searchTermArr[i]);
	}
};



