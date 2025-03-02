var header = document.getElementById("topbar");
var sep = document.getElementById("sep");
var arrow = document.getElementById("arrow");

console.log("header margin: " + header.getBoundingClientRect().height);
sep.style.marginBottom = "calc(95vh - calc(" + header.getBoundingClientRect().height + "px + " + arrow.getBoundingClientRect().height + "px))";