// ==UserScript==
// @name         zz
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  zz
// @author       jc
// @match        http://qualia.qli/*
// @match        *.qualia.io/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // Recursive function for fuzzy search
  function findByKeywords(obj, keywords, currentKey, result) {
    if (obj instanceof Array) {
      obj.forEach((member, index) => {
        let nextKey = currentKey + '.' + index;
        let toSlice = 0;
        if (nextKey.indexOf(keywords[0]) !== -1) {
          nextKey = nextKey.replace(keywords[0], '%c$&%c');
          toSlice = 1;
        }
        if (!toSlice || keywords.length > 1) {
          findByKeywords(member, keywords.slice(toSlice), nextKey, result);
        } else {
          result[nextKey] = member;
        }
      });
    } else if (typeof obj === 'object') {
      _.each(obj, (value, key) => {
        if (typeof key === 'string') {
          let nextKey = currentKey ? currentKey + '.' + key : key;
          let toSlice = 0;
          let currentKeyPart = key;
          _.every(keywords, keyword => {
            let keywordFound = nextKey.indexOf(keyword) !== -1;
            let pluralFound = nextKey.indexOf(pluralize(keyword)) !== -1;
            if (keywordFound || pluralFound) {
              toSlice += 1;
              if (keywordFound) {
                nextKey = nextKey.replace(keyword, '%c$&%c');
              } else {
                nextKey = nextKey.replace(pluralize(keyword), '%c$&%c');
              }
            }
            return keywordFound;
          });
          if (toSlice < keywords.length) {
            findByKeywords(value, keywords.slice(toSlice), nextKey, result);
          } else {
            result[nextKey] = value;
          }
        }
      });
    }
  }

  function findByString(obj, query) {
    let result = {};
    let queryArray = [...query.split(' ')];
    let colorArray = _.flatten(queryArray.map(_ => ['font-weight:bold; border-bottom:1px solid #94db94; background:#e0ffe0', '']));
    let cleanResult = {};
    findByKeywords(obj, queryArray, '', result);
    _.each(result, (value, key) => {
      console.log(key, ...colorArray);
      console.log(value);
      cleanResult[key.replace(/%c/g, '')] = value;
    });

    let keys = Object.keys(cleanResult);
    let values = Object.values(cleanResult);
    cleanresult.k = keys;
    cleanresult.v = values;

    saveToBuffer(cleanResult);
    return cleanResult;
  }

  function getBoundingBox(template) {
    let firstNode = template.firstNode;
    let lastNode = template.lastNode;
    let firstRect = firstNode.getBoundingClientRect ? firstNode.getBoundingClientRect() : firstNode.nextElementSibling.getBoundingClientRect();
    let lastRect = lastNode.getBoundingClientRect ? lastNode.getBoundingClientRect() : lastNode.previousElementSibling.getBoundingClientRect();

    let totalRect = {
      top: Math.min(firstRect.top, lastRect.top),
      bottom: Math.max(firstRect.bottom, lastRect.bottom),
      left: Math.min(firstRect.left, lastRect.left),
      right: Math.max(firstRect.right, lastRect.right),
    };

    totalRect.width = totalRect.right - totalRect.left;
    totalRect.height = totalRect.bottom - totalRect.top;
    return totalRect;
  }

  function drawFastBox(box, initDelay) {
    let $box = $('<div>').css({
      position: 'absolute',
      background: 'green',
      opacity: 0,
      height: box.height,
      width: box.width,
      top: box.top,
      left: box.left,
      'z-index': 999,
    });

    $('body').append($box);

    $box
      .delay(initDelay)
      .animate({opacity: '0.4'}, 300)
      .animate({opacity: '0'}, 300, () => $box.remove());
  }

  function drawBox(box, initDelay = 0, color = 'green') {
    let baseCSS = {
      position: 'absolute',
      background: color,
      'z-index': 1000,
    };

    let $box = $('<div>').css({
      position: 'absolute',
      background: color,
      opacity: 0,
      height: box.height,
      width: box.width,
      top: box.top,
      left: box.left,
      'z-index': 999,
    });

    let $left = $('<div>').css(_.extend({
      height: '0px',
      width: '2px',
      top: box.top,
      left: box.left,
    }, baseCSS));

    let $right = $('<div>').css(_.extend({
      height: '0px',
      width: '2px',
      top: box.bottom,
      left: box.right - 2,
    }, baseCSS));

    let $top = $('<div>').css(_.extend({
      height: '2px',
      width: '0px',
      top: box.top,
      left: box.right,
    }, baseCSS));

    let $bottom = $('<div>').css(_.extend({
      height: '2px',
      width: '0px',
      top: box.bottom - 2,
      left: box.left,
    }, baseCSS));

    $('body').append($left);
    $('body').append($right);
    $('body').append($top);
    $('body').append($bottom);
    $('body').append($box);

    let a1 = 500;
    let a2 = 500;

    $left
      .delay(initDelay)
      .animate({height: box.height}, a1)
      .animate({height: '0px', top: box.bottom}, a2, () => $left.remove());

    $right
      .delay(initDelay)
      .animate({height: box.height, top: box.top}, a1)
      .animate({height: '0px'}, a2, () => $right.remove());

    $top
      .delay(initDelay)
      .animate({width: box.width, left: box.left}, a1)
      .animate({width: '0px'}, a2, () => $top.remove());

    $bottom
      .delay(initDelay)
      .animate({width: box.width}, a1)
      .animate({width: '0px', left: box.right}, a2, () => $bottom.remove());

    $box
      .delay(initDelay)
      .animate({opacity: '0.2'}, a1)
      .animate({opacity: '0'}, a2, () => $box.remove());
  }

  function saveToBuffer(data) {
    zz.$4 = zz.$3;
    zz.$3 = zz.$2;
    zz.$1 = zz.$0;
    zz.$0 = data;
  }

  // Private variables
  window._zz = {};

  // zz
  window.zz = {

    $0: null,
    $1: null,
    $2: null,
    $3: null,

    help() {
      console.table({
        o: 'Current order',
        co: 'Current connect order',
        gc: 'Global configs',
        j: 'Undertaker jacket object used in the title section for the current order',
        sa: 'Settlement agency on from global configs that\'s currently on the order',
        t: 'Template last clicked on',
        'tpl()': 'Template last clicked on (with info)',
        'tpls()': 'Template last clicked on and all parent templates',
        'tplFind(name)': 'Find template with name',
        'mi()': 'Fill in missing info for title',
        'ss(state)': 'Set address to state',
        'of(query)': 'Order find',
        'gcf(query)': 'Global configs find',
        'f(object, query)': 'Find with given object',
        'fs()': 'File system of current order',
        '$0 - $3': 'Last four values returned by zz'
      });
      return;
    },

    // Order
    get o() {
      let order = App.Layout.stageInstance().data.order;
      if (!order) {
        order = Router.current().data().order;
      }
      if (!order) {
        throw new Error('You\'re not in an order');
      }
      return order;
    },
    
    // Connect Order
    get co() {
      let order = App.Layout.stageInstance().data.order;
      if (!order) {
        order = Router.current().data().order; 
      }
      if (!order) {
        throw new Error('You\'re not in an order');
      }
      return Connect.Orders.findOne(order._id);
    },

    // Global configs
    get gc() {
      return GlobalConfigs.findOne();
    },

    // Jacket object on order
    get j() {
      return App.Undertaker.loadJacket(this.o._id);
    },

    // Settlement agency on order
    get sa() {
      let agencyId = this.o.settlement_agency_id;
      let gcAgencies = this.gc.settlement_agencies;
      return _.find(gcAgencies, agency => agencyId === agency.agency_id);
    },

    // Order find
    of(query) {
      return findByString(this.o, query);
    },

    // Global configs find
    gcf(query) {
      return findByString(this.gc, query);
    },

    // Generic find
    f(obj, query) {
      return findByString(obj, query);
    },

    // Fix missing info
    mi() {
      let $set = {};
      if (!this.o.settlement_agency_id) {
        $set.settlement_agency_id = this.gc.settlement_agencies[0].agency_id;
      }
      if (!this.o.properties[0].address_1) {
        $set['properties.0.address_1'] = '564 Market Street';
        $set['properties.0.city'] = 'San Francisco';
        $set['properties.0.county'] = 'San Francisco';
        $set['properties.0.state'] = 'CA';
        $set['properties.0.zipcode'] = '94104';
      }
      if (!this.o.projected_close_date) {
        $set.projected_close_date = new Date();
      }
      if (!this.o.purchase_price_amount && this.o.purpose !== 'Refinance') {
        $set.purchase_price_amount = '500000';
      }
      if (!this.o[this.o.settlement_statement_type].loans[0].initial_loan_amount) {
        $set[`${this.o.settlement_statement_type}.loans.0.initial_loan_amount`] = '500000';
      }
      if (!this.o[this.o.settlement_statement_type].loans[0].loan_number) {
        $set[`${this.o.settlement_statement_type}.loans.0.loan_number`] = '420';
      }
      if (!this.o.contacts.borrowers[0].first_name) {
        $set['contacts.borrowers.0.first_name'] = 'Bob';
        $set['contacts.borrowers.0.last_name'] = 'Borrower';
      }
      if (!this.o.contacts.sellers[0].first_name) {
        $set['contacts.sellers.0.first_name'] = 'Sam';
        $set['contacts.sellers.0.last_name'] = 'Seller';
      }

      if (Object.keys($set).length) {
        console.log('Applying ', $set);
        this.o.$set($set);
      }

      if (!this.o.contacts.lenders[0].company_id) {
        App.Search.searchIndex('companies', { type: 'lender' }, { limit: 1 }, res => {
          console.log('Applying ', { 'contacts.lenders.0.company_id': res[0]._id });
          this.o.$set({ 'contacts.lenders.0.company_id': res[0]._id });
        });
      }
    },

    // Template (getter with no side effects)
    get t() {
      let template = Blaze.findTemplate(_zz.lastClick.get(0));
      while (!template.view.name.startsWith('Template') && template.parent()) {
        template = template.parent();
      }
      return template;
    },

    // Template
    tpl() {
      let template = Blaze.findTemplate(_zz.lastClick.get(0));
      if (!template) {
        throw new Error('Nothing found: the element no longer exists or you never clicked anything');
      }

      while (!template.view.name.startsWith('Template') && template.parent()) {
        console.log(`View     - ${template.view.name}`);
        template = template.parent();
      }
      console.log(`Template - ${template.view.name.split('.')[1]}`);

      let boundingBox = getBoundingBox(template);

      drawBox(boundingBox);
      saveToBuffer(template);
      return template;
    },

    // Template list
    tpls() {
      let template = Blaze.findTemplate(_zz.lastClick.get(0));
      let finished = false;
      let result = [];
      let foundIndex = 0;
      let colors = [
        { bg: 'green', c: 'white' },
        { bg: 'blue', c: 'white' },
        { bg: 'purple', c: 'white' },
        { bg: 'red', c: 'white' },
        { bg: 'orange', c: 'black' },
        { bg: 'gold', c: 'black' },
        { bg: 'limegreen', c: 'white' },
        { bg: 'slateblue', c: 'white' },
        { bg: 'orchid', c: 'white' },
        { bg: 'firebrick', c: 'white' },
        { bg: 'coral', c: 'black' },
      ];

      if (!template) {
        throw new Error('Nothing found: the element no longer exists or you never clicked anything');
      }

      while (!finished) {
        let name = template.view.name;
        if (name.startsWith('Template')) {
          console.log(`%c ${foundIndex} %c Template - ${name.split('.')[1]}`, `background: ${colors[foundIndex % colors.length].bg}; color: ${colors[foundIndex % colors.length].c}`, '');
          result.push(template);
          foundIndex += 1;
        } else {
          console.log(`    View     - ${name}`);
        }
        finished = !template.parent();
        template = template.parent();
      }

      let delay = 0;

      result.forEach((template, index) => {
        let boundingBox = getBoundingBox(template);
        drawBox(boundingBox, delay, colors[index % colors.length].bg);
        delay += 745;
      });

      saveToBuffer(result);
      return result;
    },

    // Template find
    tplFind(query) {
      let $leaves = $('*:not(:has(*))');
      let searched = new Set();
      let found = new Set();
      $leaves.each((index, node) => {
        let template = Blaze.findTemplate(node);
        let finished = !template || searched.has(template);
        while (!finished) {
          let name = template.view.name;
          if (template.view.name.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
            found.add(template);
          }
          searched.add(template);
          template = template.parent();
          finished = !template || searched.has(template);
        }
      });

      let foundList = [...found];
      let delay = 0;
      foundList.forEach((template, index) => {
        let boundingBox = getBoundingBox(template);
        drawFastBox(boundingBox, delay);
        delay += 200;
      });

      saveToBuffer(foundList);
      return foundList;
    },

    // File system on order
    fs() {
      App.Files.load(this.o.fs_id).then(fs => saveToBuffer(fs));
      let fileSystem = FileSystems.findOne(this.o.fs_id);
      if (!fileSystem) {
        throw new Error('Not subscribed to the fs - check zz.$0 for the App.Files fs when it loads');
      }
      return FileSystems.findOne(this.o.fs_id);
    },

    // Set the state
    ss(state) {
      const address = {
        AL: {county: 'Lee', city: 'Auburn', zip: '36832', address: '319 S Donahue Dr'},
        AK: {county: 'Anchorage', city: 'Anchorage', zip: '99501', address: '639 Main St'},
        AR: {county: 'Pulaski', city: 'Little Rock', zip: '72202', address: '1844 Southern Blvd'},
        AZ: {county: 'Maricopa', city: 'Phoenix', zip: '85013', address: '73 State Road 434 E'},
        CA: {county: 'Santa Clara', city: 'San Jose', zip: '95111', address: '7 W Jackson Blvd'},
        CO: {county: 'Douglas', city: 'Littleton', zip: '80126', address: '2664 Lewis Rd'},
        CT: {county: 'New Haven', city: 'New Haven', zip: '6511', address: '9122 Carpenter Ave'},
        DC: {county: 'District of Columbia', city: 'Washington', zip: '20001', address: '9 Front St'},
        DE: {county: 'Kent', city: 'Milford', zip: '19963', address: '50 S Walnut St'},
        FL: {county: 'Miami-Dade', city: 'Miami', zip: '33196', address: '678 3rd Ave'},
        GA: {county: 'Dougherty', city: 'Albany', zip: '31701', address: '9390 S Howell Ave'},
        HI: {county: 'Honolulu', city: 'Honolulu', zip: '96817', address: '185 Blackstone Bldge'},
        IA: {county: 'Polk', city: 'Des Moines', zip: '50315', address: '29 Cherry St'},
        ID: {county: 'Ada', city: 'Boise', zip: '83707', address: '74 W College St'},
        IN: {county: 'Marion', city: 'Indianapolis', zip: '46202', address: '55 Riverside Ave'},
        KS: {county: 'Johnson', city: 'Shawnee', zip: '66218', address: '86 Nw 66th St'},
        KY: {county: 'Boone', city: 'Burlington', zip: '41005', address: '9 Tower Ave'},
        LA: {county: 'Orleans', city: 'New Orleans', zip: '70116', address: '6649 N Blue Gum St'},
        MA: {county: 'Suffolk', city: 'Boston', zip: '02128', address: '38938 Park Blvd'},
        MD: {county: 'Baltimore City', city: 'Baltimore', zip: '21224', address: '228 Runamuck Pl'},
        ME: {county: 'Penobscot', city: 'Bangor', zip: '04401', address: '37855 Nolan Rd'},
        MI: {county: 'Livingston', city: 'Brighton', zip: '48116', address: '4 B Blue Ridge Blvd'},
        MN: {county: 'Hennepin', city: 'Hopkins', zip: '55343', address: '2 Lighthouse Ave'},
        MO: {county: 'Saint Louis City', city: 'Saint Louis', zip: '63104', address: '4923 Carey Ave'},
        MS: {county: 'Harrison', city: 'Biloxi', zip: '39530', address: '5 Elmwood Park Blvd'},
        MT: {county: 'Silver Bow', city: 'Butte', zip: '59701', address: '3829 Ventura Blvd'},
        NC: {county: 'Orange', city: 'Chapel Hill', zip: '27514', address: '1088 Pinehurst St'},
        ND: {county: 'Cass', city: 'Fargo', zip: '58102', address: '87 Imperial Ct'},
        NE: {county: 'Douglas', city: 'Omaha', zip: '68124', address: '21575 S Apple Creek Rd'},
        NH: {county: 'Rockingham', city: 'Plaistow', zip: '03865', address: '66552 Malone Rd'},
        NJ: {county: 'Gloucester', city: 'Bridgeport', zip: '08014', address: '8 W Cerritos Ave'},
        NM: {county: 'Dona Ana', city: 'Las Cruces', zip: '88011', address: '366 South Dr'},
        NV: {county: 'Washoe', city: 'Reno', zip: '89502', address: '73 Saint Ann St'},
        NY: {county: 'Suffolk', city: 'Middle Island', zip: '11953', address: '37275 St Rt 17m M'},
        OH: {county: 'Butler', city: 'Hamilton', zip: '45011', address: '34 Center St'},
        OK: {county: 'Tulsa', city: 'Tulsa', zip: '74105', address: '649 Tulane Ave'},
        OR: {county: 'Crook', city: 'Prineville', zip: '97754', address: '2881 Lewis Rd'},
        PA: {county: 'Montgomery', city: 'Kulpsville', zip: '19443', address: '2371 Jerrold Ave'},
        RI: {county: 'Providence', city: 'Providence', zip: '02909', address: '65895 S 16th St'},
        SC: {county: 'Richland', city: 'Columbia', zip: '29201', address: '98839 Hawthorne Blvd'},
        SD: {county: 'Minnehaha', city: 'Sioux Falls', zip: '57105', address: '5 Boston Ave'},
        TN: {county: 'Warren', city: 'Mc Minnville', zip: '37110', address: '69734 E Carrillo St'},
        TX: {county: 'Webb', city: 'Laredo', zip: '78045', address: '56 E Morehead St'},
        UT: {county: 'Salt Lake', city: 'Salt Lake City', zip: '84115', address: '51120 State Route 18'},
        VA: {county: 'Fairfax', city: 'Mc Lean', zip: '22102', address: '64 5th Ave'},
        VT: {county: 'Washington', city: 'Calais', zip: '05648', address: '50 W County Rd'},
        WA: {county: 'King', city: 'Vashon', zip: '98070', address: '8739 Hudson St'},
        WI: {county: 'Milwaukee', city: 'Milwaukee', zip: '53207', address: '322 New Horizon Blvd'},
        WV: {county: 'Harrison', city: 'Clarksburg', zip: '26301', address: '455 Traders Ave'},
        WY: {county: 'Sweetwater', city: 'Rock Springs', zip: '82901', address: '7140 University Ave'},
      }[state];

      if (address) {
        this.o.$set({
          'properties.0.address_1': address.address,
          'properties.0.city': address.city,
          'properties.0.county': address.county,
          'properties.0.state': state,
          'properties.0.zipcode': address.zip,
        });
      } else {
        throw new Error('Invalid state code');
      }
    },

    whatsForLunch() {
      $.ajax({
        url : 'https://app.zerocater.com/m/dcb45eae9a05443e921ddf5d9b3e594e',
        success(data) {
          let parsed = $.parseHTML(data);
          let $todayTile = $(parsed[parsed.length - 1]).find('.meal-tile.is-today');
          let $tomorrowTile = $todayTile.next();
          let $thirdTile = $tomorrowTile.next();
          let $fourthTile = $thirdTile.next();

          console.log(`Today      ${$todayTile.find('.meal-name').text().padEnd(30)} ${$todayTile.find('.meal-info').text()}`);
          console.log(`Tomorrow   ${$tomorrowTile.find('.meal-name').text().padEnd(30)} ${$tomorrowTile.find('.meal-info').text()}`);
          console.log(`${$thirdTile.find('.name-abbr').text().padEnd(10)} ${$thirdTile.find('.meal-name').text().padEnd(30)} ${$thirdTile.find('.meal-info').text()}`);
          console.log(`${$fourthTile.find('.name-abbr').text().padEnd(10)} ${$fourthTile.find('.meal-name').text().padEnd(30)} ${$fourthTile.find('.meal-info').text()}`);
        },
      });
    },

    imSad() {
      let quote = _.sample([
        '"Believe in yourself! Have faith in your abilities! Without a humble but reasonable confidence in your own powers you cannot be successful or happy." -Norman Vincent Peale',
        '"If you can dream it, you can do it." -Walt Disney',
        '"Where there is a will, there is a way. If there is a chance in a million that you can do something, anything, to keep what you want from ending, do it. Pry the door open or, if need be, wedge your foot in that door and keep it open." -Pauline Kael',
        '"Do not wait; the time will never be ‘just right.’ Start where you stand, and work with whatever tools you may have at your command, and better tools will be found as you go along." -George Herbert',
        '"Press forward. Do not stop, do not linger in your journey, but strive for the mark set before you." -George Whitefield',
        '"The future belongs to those who believe in the beauty of their dreams." -Eleanor Roosevelt',
        '"Aim for the moon. If you miss, you may hit a star." -W. Clement Stone',
        '"Don’t watch the clock; do what it does. Keep going." -Sam Levenson',
        '"There will be obstacles. There will be doubters. There will be mistakes. But with hard work, there are no limits." -Michael Phelps',
        '"Keep your eyes on the stars, and your feet on the ground." -Theodore Roosevelt',
        '"We aim above the mark to hit the mark." -Ralph Waldo Emerson',
        '"One way to keep momentum going is to have constantly greater goals." -Michael Korda',
        '"Change your life today. Don’t gamble on the future, act now, without delay." -Simone de Beauvoir',
        '"You just can’t beat the person who never gives up." -Babe Ruth',
        '"Start where you are. Use what you have. Do what you can." -Arthur Ashe',
        '"Why should you continue going after your dreams? Because seeing the look on the faces of the people who said you couldn’t… will be priceless." -Kevin Ngo',
        '"Never give up, for that is just the place and time that the tide will turn." -Harriet Beecher Stow',
      ]);

      let imageURL = _.sample([
        'https://i.pinimg.com/736x/41/1a/b2/411ab2ed4bbe1291e63f36b8622c333d--bestfriends-bff.jpg',
        'https://i.pinimg.com/736x/e6/ef/6f/e6ef6f00a928b92ddd9b55cb55df73cd--photos-chats-cutest-animals.jpg',
        'https://i.pinimg.com/564x/44/9f/f2/449ff2140cc4da56b186b0af58e6654f.jpg',
        'https://i.pinimg.com/736x/7e/62/39/7e623914c4bf98ab962abc48628ffbcd--teacup-maltese-puppies-teacup-puppies.jpg',
        'https://i.pinimg.com/564x/a2/72/fe/a272fed39e6b88b84e55ed332c1c62b9.jpg',
        'https://i.pinimg.com/564x/b3/f2/e8/b3f2e88c865effccdf88ed34d3f53ebf.jpg',
        'https://i.pinimg.com/236x/7f/c6/ed/7fc6edd2de498d2db498dc288e6c4cca.jpg',
        'https://i.pinimg.com/236x/7f/c6/ed/7fc6edd2de498d2db498dc288e6c4cca.jpg',
        'https://i.pinimg.com/564x/b1/8d/b9/b18db920c6b8e1ec6dad9c0f129fa11e.jpg',
      ]);

      let image = new Image();
      image.src = imageURL;
      $(image).one('load', () => {
        let height = image.height;
        let width = image.width;
        console.log('%c' + quote, 'font-family: "Zapfino"; font-size: 20px');
        console.log('%c', `padding:${image.height  / 2}px ${image.width / 2}px; line-height:${image.height / 2 + 10}px; background:url(${imageURL}) no-repeat;`);
      });
    },
  };

  $(document).click(function(event) {
    window._zz.lastClick = $(event.target);
  });

})();
