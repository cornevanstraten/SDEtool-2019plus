//Kengetallen SDE+ 2019-I
const minimumVermogen   = 15 //kWp
const basisbedrag       = 0.101 //euro per kWh
const correctiebedrag = {
  klein: { // <1MW
    netlevering: 0.041,
    eigenverbruik: 0.069,
  },
  groot: { // 1MW+
    netlevering: 0.041,
    eigenverbruik: 0.06,
  }
}
//rekenvariabelen
const gelijktijdigheid              = 0.5
const inflatie                      = 0.01
const degeneratie                   = 0.005 //per jaar
const vollasturen                   = 950
const vermogenPerM2                 = 0.142
const prijsPerVermogen              = 1050 //in euros per kWp
const onderhoudskostenPercentage    = .00454 //tov investeringsprijs
const terugleverprijsPercentage     = .5 //tov energieprijs
const gelijktijdigheidsPercentage   = .6

let Businesscase = function(){//business case constructor
  this.m2              = Number(document.querySelector("#vierkant").value.replace(/,/g, ".")),
  this.energieprijs    = Number(document.querySelector("#enp").value.replace(/,/g, ".")),
  this.verbruik        = Number(document.querySelector("#verbruik").value.replace(/,/g, ".")),
  this.dakopstelling   = document.querySelector('input[name=radiodak]:checked').value,
  this.correctiebedrag = {
    netlevering: undefined,
    eigenverbruik: undefined,
  },
  this.results = {
    terugverdientijd: undefined,
    totaleTerugleveropbrengsten: 0,
    totaleVermedenkosten: 0,
    totaleSubsidieopbrengsten: 0,
    totaleNettoOpbrengsten: 0,
  },
  this.productieZelf = [],
  this.productieNet = [],
  this.vermedenkosten = [],
  this.terugleveropbrengsten = [],
  this.subsidieopbrengsten = [],
  this.totaleOpbrengsten = [],
  this.onderhoudskosten = [],
  this.nettoKasStromen = [],
  this.cummulatieveKasStromen = [],
  this.jarenPositief = []
}

Businesscase.prototype.calcVars = function(){
  this.vermogenPV = Math.round(this.m2 * vermogenPerM2);
  this.opwek = Math.round(this.vermogenPV * vollasturen);
  this.investeringsprijs = Math.round(this.vermogenPV * prijsPerVermogen);
  this.onderhoud = Math.round(this.investeringsprijs * onderhoudskostenPercentage);
  this.terugleverprijs = this.energieprijs * terugleverprijsPercentage;
  if(this.opwek > this.verbruik) {
    this.gelijktijdigheid = gelijktijdigheidsPercentage
  } else {
    this.gelijktijdigheid = (this.verbruik/this.opwek) * gelijktijdigheidsPercentage
  };
  if(this.vermogenPV < minimumVermogen){
    alert("U heeft een te klein vermogen om SDE+ aan te vragen. Uw installatie moet minimaal " + minimumVermogen + "kWp aan vermogen hebben.");
  } else if(this.vermogenPV < 1000){
    this.correctiebedrag.netlevering = correctiebedrag.klein.netlevering;
    this.correctiebedrag.eigenverbruik = correctiebedrag.klein.eigenverbruik;
  } else {
    this.correctiebedrag.netlevering = correctiebedrag.groot.netlevering;
    this.correctiebedrag.eigenverbruik = correctiebedrag.groot.eigenverbruik;
  }
}

Businesscase.prototype.calcArrays = function(){
    let cumulatieveOpbrengst = this.investeringsprijs * (-1)
    for (i = 0; i < 15; i++) { //voor ieder van de 15 jaren
      this.productieZelf.push(Math.round(this.gelijktijdigheid * (this.vermogenPV * vollasturen * Math.pow((1-degeneratie), i))));
      this.productieNet.push(Math.round((1 - this.gelijktijdigheid) * (this.vermogenPV * vollasturen * Math.pow((1-degeneratie), i))));
      this.vermedenkosten.push(Math.round(this.productieZelf[i] * this.energieprijs * Math.pow((1+inflatie), i)));
      this.terugleveropbrengsten.push(Math.round(this.productieNet[i] * this.terugleverprijs * Math.pow((1+inflatie), i)));
      this.subsidieopbrengsten.push(
        Math.round(this.productieNet[i]*(basisbedrag-this.correctiebedrag.netlevering))
        +
        Math.round(this.productieZelf[i]*(basisbedrag-this.correctiebedrag.eigenverbruik))
      );
      this.totaleOpbrengsten.push(
        this.vermedenkosten[i] +
        this.terugleveropbrengsten[i] +
        this.subsidieopbrengsten[i]
      );
      this.onderhoudskosten.push(Math.round(this.onderhoud*Math.pow((1+inflatie), i)));
      this.nettoKasStromen.push(Math.round(this.totaleOpbrengsten[i] - this.onderhoudskosten[i]));
      cumulatieveOpbrengst += Math.round(this.nettoKasStromen[i]);
      this.cummulatieveKasStromen.push(cumulatieveOpbrengst);
      if (this.cummulatieveKasStromen[i] > 0){
        this.jarenPositief.push(i+1);
      }
    }
}

Businesscase.prototype.calcResults = function(){
      for (i = 0; i < 15; i++) {
        this.results.terugverdientijd = this.jarenPositief[0];
        this.results.totaleTerugleveropbrengsten += this.terugleveropbrengsten[i];
        this.results.totaleVermedenkosten += this.vermedenkosten[i];
        this.results.totaleSubsidieopbrengsten += this.subsidieopbrengsten[i];
        this.results.totaleNettoOpbrengsten += this.nettoKasStromen[i];
      }
}

Businesscase.prototype.displayGraph = function(){ //lijngrafiek
      let grafiekData = {
        labels : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"],
        datasets : [
          {
            fillColor : "rgba(172,194,132, 0.0)",
            strokeColor : "#3498db",
            pointColor : "#fff",
            pointStrokeColor : "#3498db",
            data : this.cummulatieveKasStromen
          }
        ]
      }
      let grafiek = document.getElementById("grafiek").getContext('2d');
      let nieuweGraf = new Chart(grafiek)
      let nieuweGraf_instance = nieuweGraf.Line(grafiekData);
}

Businesscase.prototype.displayBar = function(){
      var barData = {
      	labels : ["besparing", "subsidie", "teruglevering"],
      	datasets : [
      		{
            fillColor: ["rgba(52, 152, 219, 0.2)"],
      			strokeColor : ["#48A4D1"],
      			data : [
              this.results.totaleVermedenkosten,
              this.results.totaleSubsidieopbrengsten,
              this.results.totaleTerugleveropbrengsten
            ]
      		},
      	]
      }
      var income = document.getElementById("staaf").getContext("2d");
      new Chart(income).Bar(barData);
}

Businesscase.prototype.displayResults = function(){
  var old_list = document.getElementById('results');
  var parent = old_list.parentNode;
  var new_list = document.createElement('span');
  new_list.innerHTML = '<div id="results"><div><h4>Kerngegevens:</h4><ul><li>Vermogen installatie: <strong>' + this.vermogenPV + 'kWp</strong></li><li>Terugverdientijd: <strong>' + this.results.terugverdientijd +' jaar</strong></li><li>Subsidieopbrengsten: <strong>' + this.results.totaleSubsidieopbrengsten + ' euro</strong></li><li>Totale netto opbrengsten: <strong>' + this.results.totaleNettoOpbrengsten + ' euro</strong></li></ul>'

  parent.replaceChild(new_list, old_list);
}


document.getElementById("buca").addEventListener("click", init)

function init(){
  let newBusinesscase = new Businesscase()
  newBusinesscase.calcVars();
  newBusinesscase.calcArrays();
  newBusinesscase.calcResults();
  toggleAndScroll("bucashow");
  newBusinesscase.displayGraph();
  newBusinesscase.displayBar();
  newBusinesscase.displayResults();
  return newBusinesscase
}

function toggleAndScroll(id) {
  var element = document.getElementById(id);
    element.style.display = "block";
    element.scrollIntoView();
}

console.log("SDEtool was developed by Corné van Straten")
