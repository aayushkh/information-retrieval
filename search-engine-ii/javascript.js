/* EVENT LISTENERS */
$(document).ready(function(){

  /* Autocomplete AJAX call */
  $("#q").on('input', function(){
    var input = $(this).val();
    $.ajax({
      type: "GET", 
      url: "Autocomplete.php?input=" + input,
      dataType: "text", 
      success: function(result){
        if (result) {
          autocompleteSuggestions(JSON.parse(result), input);
        }
      }
    });
  });

  /* Fill input box with autocomplete suggestion */
  $(document).on("click", ".auto-suggestion", function(){
    var suggestion = $(this).text();
    $("#q").val(suggestion);
    $("#autocomplete").hide();
    $("#autocomplete").empty();
  });

  /* Fill input with spell correction and submit form */
  $(document).on("click", "#correct-word", function(){
    var word = $(this).text();
    $("#q").val(word);
    $("#did-you-mean").remove();
    $("form").submit();
  });

});

/* Autocomplete suggestions appear as user types letters in input box */
function autocompleteSuggestions(jsonObj, input){
  var autocompleteHtml = $("#autocomplete");
  if (input != "") {
    var suggestions;
    autocompleteHtml.empty();
    if (jsonObj.suggest.suggest[input]) {
      suggestions = jsonObj.suggest.suggest[input].suggestions;
    }
    if (suggestions) {
      autocompleteHtml.show();
      suggestions.forEach(function(word){
        autocompleteHtml.append("<div class='auto-suggestion'>" + word.term + "</div>");
      });
    }
    else {
      autocompleteHtml.hide();
      autocompleteHtml.empty();
    }
  }
  else {
    autocompleteHtml.hide();
    autocompleteHtml.empty();
  }
}


/* THE HELL THAT IS SNIPPETS */

/* GET DESCRIPTION FOR EACH SEARCH RESULT */
var count = -1;
function display_snippet(description, id) {
  count ++;

  var query = $("#q").val();
  var queryWords = query.split(" ");
  var content = getPage(id);
  var display = false;
  var snippetCreated = false;

  // 1. single word or multi-word query, exact match in description
  display = description.toLowerCase().includes(query.toLowerCase());
  (display && !snippetCreated) ? snippetCreated = print_snippet(description) : false;

  // 2. single-word or multi-word query, exact match in html docs
  display = exactMatch(content, query);
  (display && !snippetCreated) ? snippetCreated = print_snippet(display) : false;

  // 3. any match in html description
  display = anyMatch(content, query);
  (display && !snippetCreated) ? snippetCreated = print_snippet(display) : false;

}

function print_snippet (display) {
  temp = display.substring(0, 200) + "..."
  var el = $(".snip-potato:eq(" + count + ")");
  el.append("<p><b>Snippet: </b>" + temp +  "</p>");
  return true;
}

function exactMatch(content, query) {
  var sentences = content.split(".");
  var lowerCaseSentences = content.toLowerCase().split(".");
  var lowerCaseQuery = query.toLowerCase();
  for (var i = 0; i < sentences.length; i++){
    if (lowerCaseSentences[i].includes(lowerCaseQuery)){
      return sentences[i] + "...";
    }
  }
  return false;

}

function anyMatch(content, queryWords) {
  var sentences = content.split(".");
  var lowerCaseSentences = content.toLowerCase().split(".");
  var lowerCaseQuery = queryWords.toLowerCase().split(".");
  var output = "";
  for (var j = 0; j < queryWords.length; j++ ) {
    for (var i = 0; i < sentences.length; i++) {
      if (lowerCaseSentences[i].includes(lowerCaseQuery[j])) {
        output = output + sentences[i];
      }
    }
  }
  if (output != "") {
    return output;
  }
  return false;
}

/* Get page content */
function getPage(id) {
  var path = id.split("/");
  path = path[path.length-1];
  path = "nypost/" + path;
  var content = false;
  $.ajax({
    type: "GET",
    url: path, 
    async: false,
    dataType: "text",
    success: function(result){
      content = result;
    }
  });

  content = JSON.stringify(content);
  content = content.split("</head>").pop();
  content = content.replace(/<script.*?<\/script>/g, '');
  content = content.replace(/<svg.*?<\/svg>/g, '');
  content = content.replace(/<style.*?<\/style>/g, '');
  content = strip(content).trim();
  content = content.replace(/\s+/g," ");
  content = content.replace(/\\[trn]/g, "."); // for replacing \n \r

  return content;
}

function strip(html) {
   var tmp = document.createElement("div");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}


