'use strict'
const importantDB = { "1": 2, "2": 2, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1, "8": 1, "9": 1, "10": 1, "11": 1, "12": 1, "13": 1, "14": 1, "15": 1, "16": 1, "17": 1, "18": 1, "19": 1, "20": 1, "257": 2, "268": 2, "259": 1, "260": 1, "261": 1, "262": 1, "263": 1, "264": 1, "265": 1, "266": 1, "267": 1, "258": 1, "269": 1, "270": 1, "271": 1, "272": 1, "273": 1, "274": 1, "275": 1, "276": 1 };
var levelsCounter = [0, 0, 0];
var successCounter = 0;

//from babel
function objectWithoutProperties(obj, keys) {
    var target = {};
    for (var i in obj) {
        if (keys.indexOf(i) >= 0) continue;
        if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
        target[i] = obj[i];
    }
    return target;
}

function buildName_Description_tripleObjectStore(data3) {
    nameObject = {};
    descObject = {};
    tripleObject = {};
    data3.people.forEach((person, index) => {
        if (window.dataLimit && index > dataLimit) {
            console.log(index);
            //debugger;
            return;
        }
        person.id = String(person.id); //id's have to be strings

        nameObject[person.id] = {
            "http://xmlns.com/foaf/0.1/name": [{
                "type": "literal",
                "value": person.name,
                "lang": "en"
            }
            ]
        };
        descObject[person.id] = objectWithoutProperties(person, ['id']);
        descObject[person.id].conCounters = { '1': 0, '2': 0, '3': 0, 'success': 0 };
    });

    data3.cons.forEach((con) => {
        con.p1 = String(con.p1); //id's have to be strings
        con.p2 = String(con.p2);
        if (!descObject[con.p1]) {
            console.log('error! invalid person connection person', con.p1, 'does not exist');
            return
        }
        if (!descObject[con.p2]) {
            console.log('error! invalid person connection person', con.p2, 'does not exist');
            return
        }

        //make sure there are no repeated connections!
        if (tripleObject.hasOwnProperty(con.p2)) {
            if (tripleObject[con.p2]["http://purl.org/vocab/relationship/knowsOf"]
				.filter(connection => connection.value === con.p1).length) {
                console.log('warning! duplicate connetcion found between id', con.p1, con.p2, '! results may not be correct!!!');
            }
        }

        if (!tripleObject.hasOwnProperty(con.p1)) {
            tripleObject[con.p1] = {
                "http://purl.org/vocab/relationship/knowsOf": [{
                    "type": "uri",
                    "value": con.p2,
                    "level": con.level
                }
                ]
            };
        } else {
            tripleObject[con.p1]["http://purl.org/vocab/relationship/knowsOf"].push({
                "type": "uri",
                "value": con.p2,
                "level": con.level
            });
        }
    });
    updateHeaderData(data3);
    addOnclicks();
}

function updateHeaderData(data3) {
    $('#header-attendees').text('49,236');
    //$('#header-attendees').text(data3.people.length);
    //$('#header-matches').text(data3.cons.length);
    data3.cons.forEach((con) => {
        if (!descObject[con.p1]) {
            console.log('error! invalid person connection person', con.p1, 'does not exist');
            return
        }
        if (!descObject[con.p2]) {
            console.log('error! invalid person connection person', con.p2, 'does not exist');
            return
        }
        levelsCounter[con.level - 1]++;
        descObject[con.p1].conCounters[con.level]++;
        descObject[con.p2].conCounters[con.level]++;
        if (con.success) {
            successCounter++;
            descObject[con.p1].conCounters.success++
            descObject[con.p2].conCounters.success++
        }
    });
    updateHeader();
}

function getDescHTML(d) {
    var descText = '';
    if (descObject.hasOwnProperty(d.id)) {
        /*
		if (descObject[d.id]['http://dbpedia.org/ontology/abstract']){

		var desc = descObject[d.id]['http://dbpedia.org/ontology/abstract'][0].value;
		var r = /\\u([\d\w]{4})/gi;
		desc = desc.replace(r, function (match, grp) {
		return String.fromCharCode(parseInt(grp, 16)); } );
		desc = unescape(desc);
		descText = decodeURIComponent(desc);
		descText = descText.replace(/&ndash;/gi,'-');
		descText = descText.replace(/&amp;/gi,'&');

		var link = d.id.replace('dbpedia','wikipedia').replace('resource','wiki');

		if (link.indexOf('wikipedia')>=0){
		descText = descText.substring(0,250) + '...' + '<br>' + '<a class="popup-link" target="_blank" href="' + link + '">From Wikipedia</a><br><br>';
		}
		 */
        descText = descObject[d.id].bio;
    } else {
        descText = "";
    }
    return descText;
}

function getDescText(d) {
    var descText = '';
    if (descObject.hasOwnProperty(d.id)) {
        descText = descObject[d.id].bio;
    }
    return descText;
}

function updatePopUp(d) {
    var id = d.id;
    $('#popUp-name').text(descObject[id].name);
    $('#popUp-comp_name').text(descObject[id].comp_name);
    $('#popUp-pos').text(descObject[id].pos);
    $('#u12_img').attr('src', descObject[id].pic_url);
    document.querySelector('#u40').onclick = function () {
        showFullProfile(id);
    };
    $('#popUp-matches').text(d.connections);
    $('#popUp-h').text(descObject[id].conCounters['3']);
    $('#popUp-m').text(descObject[id].conCounters['2']);
    $('#popUp-l').text(descObject[id].conCounters['1']);
    $('#popUp-meetings').text(descObject[id].conCounters.success);

    //console.log(d);
}

function addOnclicks() {
    document.querySelector('#u265').onclick = switchToPerson;
    document.querySelector('#u269').onclick = switchToPerson;
    document.querySelector('#u267').onclick = switchToCompany;
    document.querySelector('#u271').onclick = switchToCompany;

    document.querySelector('#u257').onclick = hideFullProfile
}

function switchToCompany() {
    $('.u265-u267_div-selected').removeClass('u265-u267_div-selected');
    $('#u267_div').addClass('u265-u267_div-selected');
    $('#u278').show()
    $('#u277').hide()
}

function switchToPerson() {
    $('.u265-u267_div-selected').removeClass('u265-u267_div-selected');
    $('#u265_div').addClass('u265-u267_div-selected');
    $('#u277').show()
    $('#u278').hide()
}

function showFullProfile(id) {

    $('#fullProfile-name').text(descObject[id].name);
    $('#fullProfile-comp_name').text(descObject[id].comp_name);
    $('#fullProfile-pos').text(descObject[id].pos);
    $('#u261_img').attr('src', descObject[id].pic_url);

    $('#u277_img').attr('src', descObject[id].pic_url);
    $('#u278_img').attr('src', descObject[id].logo_url);

    switchToPerson();

    $('#full-profile').show();
    //sometimes the addclass works too quickly so the animation doesn't play. settimeout,0 does the trick
    setTimeout(() => $('#u252_state0').addClass('u252_state0-visible'));
}

function hideFullProfile() {
    $('#u252_state0').removeClass('u252_state0-visible')
	.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {
	    $('#full-profile').hide()
	});
}

function getConnectionLevel(id1, id2) {
    return tripleObject[id1]["http://purl.org/vocab/relationship/knowsOf"]
	.filter(connection => connection.value === id2)[0].level;
}

function getConnectionColor(d1, d2) {
    var conLevel = getConnectionLevel(d1.id, d2.id);
    switch (conLevel) {
        case 1:
            return '#0FF3FE'
        case 2:
            return '#75607F' 
        case 3:
            return '#CD6B78'
    }
}

function getLinkStrength(d1, d2) {
    var conLevel = getConnectionLevel(d1.id, d2.id);
    switch (conLevel) {
        case 1:
            return 0.1
        case 2:
            return 0.3
        case 3:
            return 0.9
    }
}

function showConnections() {
    $('#screen').hide();
    $('#over').fadeOut(500);
    $('#workspace').fadeIn(500);
    
    $('#show-button').fadeOut(1000);

    $('#network').fadeOut(1000, () => {
        var sheet = document.createElement('style')
        sheet.innerHTML = 'line.link {display:block;}';
        sheet.id = 'showConnections';
        document.body.appendChild(sheet);
        //$("#screen").style.display = none;
        $('#network').show();
    });

}


function hideConnections() {
    var sheet = document.querySelector('#showConnections');
    if (sheet) {
        sheet.parentNode.removeChild(sheet);
    }
}

function isImportant(id) {
    if (importantDB.hasOwnProperty(id)) return importantDB[id];
    else return false;
}

function importantFactor(id, value) {
    if (!importantDB.hasOwnProperty(id))
        return value + 6;
    if (importantDB[id] === 1)
        return Math.round(value * 3.5 + 18)
    return value * 2 + 65;
}
function calcNodeSize(d) {
    var result = Math.round(150 / Math.sqrt(nodes.length) * (d.connections / largestConnection + 0.1) * 2.5); //15;
    result = importantFactor(d.id, result);
    return result;
}

function updateHeader(id) {
    if (id) {
        console.log(id);
        $('#header-matches').text(descObject[id].conCounters['1'] + descObject[id].conCounters['2'] + descObject[id].conCounters['3']);
        $('#header-high').text(descObject[id].conCounters['3']);
        $('#header-medium').text(descObject[id].conCounters['2']);
        $('#header-low').text(descObject[id].conCounters['1']);
        $('#header-meetings').text(descObject[id].conCounters.success);
    } else {
        //$('#header-low').text(levelsCounter[0]);
        //$('#header-medium').text(levelsCounter[1]);
        //$('#header-high').text(levelsCounter[2]);
        //$('#header-matches').text(levelsCounter[0] + levelsCounter[1] + levelsCounter[2]);
        //$('#header-meetings').text(successCounter);
        $('#header-low').text('1,015,669');
        $('#header-medium').text('435,287');
        $('#header-high').text('75,396');
        $('#header-matches').text('1,526,351');
        $('#header-meetings').text('293,039');
    }
}

function switchToWavemode() {
    baseNodes = [];
    baseLinks = [];
    connectionCounter = {};
    buildBase();
    updateHeader();
    changeVisMode("wave")
}
