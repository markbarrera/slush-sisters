#!/usr/bin/env node
/**
 * Builds the reading room — the visual, readable version of everything in
 * docs/, made for Finley and Harper rather than for an adult.
 *
 *   node docs/board/reading-room.js public/read
 *
 * Every strategy document in this repo is written for a grown-up. That is
 * correct for the documents and useless for the two people who actually own
 * the business. This turns each one into cards they can scan, in language
 * that does not need translating, without dumbing down the actual thinking.
 *
 * Pages are orphans: noindex, not in the sitemap, not linked from the site.
 * You reach them because someone gave you the link.
 */

const fs = require('fs');
const path = require('path');
const SOUR = fs.readFileSync('/root/.fonts/brand-1.ttf').toString('base64');

/* ---------------------------------------------------------------------------
   THE CONTENT
   Each page: { slug, title, kicker, lede, close, groups: [...] }
   Each group: { name, colour, blurb, cards: [...] }
   Card kinds:
     ['plain',  title, body]
     ['debate', title, forSide, againstSide, landing]
     ['number', title, bigNumber, body]
--------------------------------------------------------------------------- */

const PAGES = [

/* ========================= 1. WHAT WE FIGURED OUT ======================== */
{
  slug: 'what-we-figured-out',
  title: 'What we figured out',
  kicker: 'The big think',
  lede: `We asked five different people to study your business and argue with each other about it. On purpose. Here is what they said, including the parts where they disagreed — because the disagreements are the useful bit.`,
  close: [
    ['Nobody agreed about everything, and that is fine.',
     `A room where everyone agrees is a room where nobody is thinking. The best thing in this whole document is the arguments, not the answers.`],
    ['You are allowed to disagree with all of it.',
     `It is your company. These are five opinions from people who have never met you. Some of them are probably wrong. Work out which ones.`],
  ],
  groups: [
{
  name: 'How big could this actually get?',
  colour: '#4fc3f7',
  blurb: 'Somebody said you could only ever make $27,000 a year. They were wrong, and the reason why is interesting.',
  cards: [
    ['number', 'The $27,000 was not about customers', '104',
     `Somebody worked out you could only make $27,000 a year. Then someone else did the maths: $27,000 divided by $250 is 108 parties. And there are only about 104 weekend nights in a year. So that number was not "how many people want this." It was "how many Saturdays exist." Those are completely different things.`],

    ['plain', 'One machine is not a rule of nature',
     `A second machine costs around $1,500 and pays for itself in about ten parties. If you keep saying no to people because the machine is busy, the machine is the problem — and problems you can buy your way out of are the good kind.`],

    ['plain', 'The thing you actually run out of is Saturdays',
     `Not machines. Not customers. There are roughly 25,000 to 35,000 households near you with money to spend on parties. You are never going to run out of those. You run out of weekend afternoons when a grown-up can drive the van.`],

    ['debate', 'So should you buy another machine?',
     `Machines are cheap and they pay for themselves fast. If you are turning people away you are turning away money.`,
     `You do not actually know if you are turning people away, because nobody is writing it down. Buying a machine for a problem you have not proved is just spending money.`,
     `Keep a list. Write down every single time you have to say no because the machine is already booked. When that list gets to three names, buy the second machine. Not before.`],
  ],
},
{
  name: 'The best idea nobody was arguing about',
  colour: '#ffb74d',
  blurb: 'This one came up sideways and it might be the most important thing in here.',
  cards: [
    ['plain', 'Stop renting the machine. Sell the cups.',
     `Right now you rent the machine for $250 and someone else pours the drinks. There is another way to do it: take the machine to a school fair or a church festival and sell cups yourself, and give some of the money back to the school.`],

    ['number', 'Same machine. Same night. Twice the money.', '$540',
     `A school carnival with 300 people, two hours, $3 a cup, and about six out of ten people buy one. That is around $540 — against $250 for renting it out. Same machine, same van, same evening.`],

    ['plain', 'A company already proved this works',
     `Kona Ice does exactly this with about 1,933 trucks and made $352 million in one year. That is roughly $182,000 per truck. They do not rent anything out. They show up at events and sell cups.`],

    ['plain', 'And here is the part that matters most',
     `There is no alcohol anywhere near it. Which means <b>you two can actually be the ones serving</b>. Every other version of this business has grown-ups doing the interesting part. This one does not.`],

    ['debate', 'Is there a catch?',
     `Higher money, no alcohol problem, schools almost always say yes when kids offer to give some back, and you get to run it.`,
     `Selling food to the public needs a permit, which costs somewhere between $309 and about $1,000. It is also a much longer day than dropping a machine off.`,
     `A few hundred dollars is a small price for the only version of this business you can fully run yourselves. Dad needs to check the permit before the first one.`],
  ],
},
{
  name: 'The two-tank idea',
  colour: '#ba68c8',
  blurb: 'The single best thing anyone said. It is about a machine you already own.',
  cards: [
    ['plain', 'Your machine has two tanks',
     `You already knew that. Here is what nobody had noticed: a backyard party on a Saturday afternoon is <b>two parties happening at once</b>. Kids running around. Grown-ups standing near a cooler.`],

    ['plain', 'Everyone else only sells to half the party',
     `A margarita company is awkward at a party full of kids. A kids' slushie company does not get asked about the grown-ups. You are the only ones who can do both, because one tank can be for the kids and one tank can be for the parents.`],

    ['plain', 'Your age is the reason it works, not a problem',
     `A regular margarita company selling into a party with children there has a weird conversation to have. Two sisters whose logo is a candy on a cup do not. The thing people worried about is the actual advantage.`],

    ['plain', 'It also does cold drinks, which nobody advertises',
     `The machine will chill a drink without freezing it. That means December works as well as July — and December is currently worth nothing to you, because nobody wants a slushie at Christmas.`],
  ],
},
{
  name: 'Money',
  colour: '#81c784',
  blurb: 'The awkward one. All of this is a Dad decision, not yours — but you should know the argument.',
  cards: [
    ['number', 'You charge less than everyone else', '$250',
     `ATX Marg Rentals charges $350 for basically the same thing, and they do not give you a candy garnish or come back the next morning. One other company charges $185 for the machine on its own, and $485 for the machine plus a bartender.`],

    ['debate', 'Should the price go up?',
     `You give people more than the $350 company does and charge $100 less. Going to $325 would earn thousands more a year and takes about a minute to do.`,
     `Some people book you partly because they like supporting two kids. Those are exactly the people who would notice the price jumping by 40%.`,
     `Put the price up <b>and</b> make what people get visibly better at the same time — so they are buying more, not just paying more. This one is Dad's call.`],

    ['plain', 'Why the price is not really about limes',
     `Almost everything it costs to do a party — the driving, the setting up, the taking down, the cleaning — costs the same whether 20 people come or 60. Only the mix and the cups change. So a more expensive party is not much more work. It is mostly just more money.`],
  ],
},
{
  name: 'The rules about grown-up drinks',
  colour: '#e57373',
  blurb: 'Everyone who looked at this ended up in the same place, from completely different directions.',
  cards: [
    ['plain', 'The rule everybody agreed on',
     `You set the machine up in the daytime with ordinary non-alcoholic mix in it. You do the garnish, hand over the flavour card, and go home. If grown-ups put something in it afterwards, that is theirs and you are not there. <b>Nobody under 18 is around once there is alcohol in the tank.</b>`],

    ['plain', 'Some people said that limits you. It does not.',
     `One person argued this means the grown-up business happens in rooms you cannot be in, so what is the point. But the machine leaves your house with limeade in it, and that is the whole business. What happens later is somebody else's party.`],

    ['plain', 'The Tequila Refusal',
     `There should be a page on the website that just says it plainly: our machine makes frozen limeade, grown-ups add their own, and we will not take money from an alcohol company. Written now, that is a principle. Written after something goes wrong, it is an excuse.`],

    ['plain', 'The thing to actually be careful about',
     `Not the law — the photos. A picture of one of you at a grown-up party at night, next to a machine full of margaritas, would travel around the internet fast, and every fact in it would be true. So: no filming at grown-up parties after dark. Ever. Daytime, limes, machines and numbers only.`],
  ],
},
{
  name: 'What happened to other kids who did this',
  colour: '#64b5f6',
  blurb: 'Five real kid-founded businesses, and what actually became of them.',
  cards: [
    ['plain', 'Mikaila Ulmer — Austin, started at 4',
     `Me &amp; the Bees Lemonade. Now in around 600 shops including Whole Foods and H-E-B, wrote a book with a big publisher, and runs the company remotely while she studies economics at university. This is the one to aim at.`],

    ['plain', 'Alina Morse — started at 7',
     `Zolli Candy. Six million dollars of sales by the time she was 13. In more than 25,000 shops now.`],

    ['plain', 'Moziah Bridges — started at 9',
     `Mo's Bows, selling bow ties. Sold in Neiman Marcus, did a deal with the NBA, and is still running it at 24.`],

    ['plain', 'Maddie Bradshaw — started at 10, and this one is a warning',
     `M3 Girl Designs was in over 1,000 shops. Then the company sued some small competitors over a design it had never actually registered, lost, and shut down in 2015. <b>Do not sue people.</b>`],

    ['plain', 'The pattern in all of them',
     `Every single one that got big stopped doing a service and started selling a <b>thing</b> — something in a box that can be posted to someone. You are currently a service: hours of a machine in a van. Somebody in another state cannot rent your machine. They could buy a box of your garnish.`],

    ['plain', 'And the honest bit',
     `Loads of kids start businesses. Most of them stop. The most likely thing that happens here is that it winds down in a few years when other things get more interesting — and that is completely normal and not a failure. It is just worth knowing, so that carrying on is a choice you make instead of something you assume.`],
  ],
},
  ],
},

/* ========================= 2. HOW WE BUILT THE SITE ====================== */
{
  slug: 'how-we-built-this',
  title: 'How we built this',
  kicker: 'The build story',
  lede: `Everything that has been done to the website, why it was done, and the bits that were got wrong. The mistakes are left in on purpose. A story where nothing goes wrong is not a story and it does not teach anybody anything.`,
  close: [
    ['Why we write down the mistakes',
     `Anyone can list the things that worked. The useful part is the thing somebody got wrong and then fixed, because that is the part other people can learn from — including you two, later.`],
    ['The record starts the day you decide to keep one',
     `There is no record of what this website looked like before August 2026, because nobody was keeping one. Everything before that is just gone. That is the first lesson.`],
  ],
  groups: [
{
  name: 'The worst thing we found',
  colour: '#e57373',
  blurb: 'Day one. This is why you check things instead of assuming they work.',
  cards: [
    ['plain', 'The booking form was lying to people',
     `You could fill in the form and press the button, and it said "thanks, we will be in touch." It did not send anything anywhere. Every single person who ever asked to book a party through that form was told it worked, and then nothing happened. Nobody knew.`],

    ['plain', 'How that even happens',
     `The button did not send the form. It just hid itself and showed the thank-you message. It looked exactly like a working form and it was a picture of one.`],

    ['plain', 'What it does now',
     `It only says thank you if the message genuinely got through. And if it is not switched on, it says so honestly instead of pretending. A form that says nothing is better than a form that lies.`],
  ],
},
{
  name: 'Other things that were quietly broken',
  colour: '#ffb74d',
  blurb: 'All of these looked completely fine from the outside.',
  cards: [
    ['plain', 'The Instagram link went to a stranger',
     `The bottom of every page said to find you at instagram.com/slushsisters. That account belongs to somebody else — a soap company with three followers. Anyone who followed that instruction landed on a stranger's page.`],

    ['plain', 'Wrong web addresses showed the homepage',
     `If you typed the address slightly wrong, instead of saying "that page does not exist" the site just showed the homepage and pretended everything was fine. Confusing for people, and confusing for Google.`],

    ['plain', 'Updates were not actually showing up',
     `Changes were being made and the live site kept showing the old version, because it was saving a copy to be quick. Fixed so it clears the old copy automatically now.`],

    ['plain', 'Photos knew where you live',
     `Photos taken on a phone quietly record the exact spot they were taken. The pictures of you two were taken at home. All of that got stripped out before anything went on the website.`],
  ],
},
{
  name: 'The phone problem',
  colour: '#4fc3f7',
  blurb: 'Almost everyone who visits your site is on a phone. The site was not really built for one.',
  cards: [
    ['number', 'The Book button was invisible on a phone', '0',
     `On a phone, the whole menu — including the Book button — was hidden behind the ☰ symbol. The one button the entire website exists to make people press was invisible unless you tapped something else first.`],

    ['plain', 'Now it is always there',
     `There is a Book button in the top bar of every page, at every size, that is not hidden in the menu. It is also big enough to hit properly with a thumb, which is a real measurement: 44 pixels.`],

    ['plain', 'A mistake made while fixing it',
     `The button was built at 40 pixels first. The minimum a thumb reliably hits is 44. It only got caught because it was measured in a real browser instead of being assumed to be fine.`],

    ['plain', 'Another one: a bug in the checking tool',
     `A tool was written to check every page for a visible Book button. It reported that all eight pages had failed. They had not — the tool was looking at the wrong button. The website was fine and the thing checking the website was broken.`],

    ['plain', 'One that turned out to be nothing',
     `There was a suspicion the homepage was sending a huge photo to phones and making them slow. It was not — the site was already sending a smaller one. Worth checking before "fixing" something that already worked.`],
  ],
},
{
  name: 'Things that got added',
  colour: '#81c784',
  blurb: 'New bits of the site, and why each one exists.',
  cards: [
    ['plain', 'Six pages for six places',
     `Lakeway, Bee Cave, Lake Travis, Steiner Ranch, Lake Austin and Dripping Springs each got their own page, so somebody searching for their own town finds a page about their own town.`],

    ['plain', 'An Austin page for when the news finds you',
     `If an Austin newspaper or TV station does a story about you, the whole city arrives at once. Every other page is either about one small town or written for grown-ups booking margaritas. The Austin page covers the whole area and answers "are they really kids" straight away.`],

    ['plain', 'The idea board',
     `The one you already use. Every idea anyone has had, on cards, so you can pick.`],

    ['plain', 'Photographs of the site, every time it changes',
     `There is now a tool that takes a picture of every page — as a phone sees it and as a computer sees it — and saves them with the date. So there will be a real record of what this looked like as it grew.`],
  ],
},
  ],
},

/* ====================== 3. HOW PEOPLE FIND OUT ABOUT YOU ================= */
{
  slug: 'how-people-find-us',
  title: 'How people find out about you',
  kicker: 'Getting known',
  lede: `The short version of the marketing plan. The long version lives in a document written for grown-ups; this is the part that matters and it is mostly not what people expect.`,
  close: [
    ['If you only remember one thing',
     `Show the business, not the drink. When you are stuck for something to post, that sentence answers it.`],
  ],
  groups: [
{
  name: 'The thing everyone gets wrong',
  colour: '#ba68c8',
  blurb: 'This is the most important idea in the whole marketing plan.',
  cards: [
    ['plain', 'Nobody shares a video about a slushie',
     `They share videos about two kids running a real business. A nice drink gets a like and gets forgotten. Counting the money out loud, or working out what you still owe Dad for the machine, gets <b>sent to someone</b>.`],

    ['plain', 'So post the boring parts',
     `Cleaning the machine. Loading the van. The setup that went wrong in the rain. The maths on whether a booking far away is even worth the drive. Those are the ones that travel.`],

    ['plain', 'About half of it should not be selling anything',
     `If everything you post is about the product, the only people who follow you are people who already want one. That is a very small group. The other half is just you two being interesting.`],
  ],
},
{
  name: 'Where the customers actually come from',
  colour: '#4fc3f7',
  blurb: 'Not where you would guess.',
  cards: [
    ['plain', 'Neighbourhood Facebook groups beat everything',
     `For a kids' party rental, a post in a local neighbourhood group works better than Instagram and better than Google. It is a small, unglamorous thing that works far better than the exciting-sounding options.`],

    ['number', 'Searching is a smaller pond than it sounds', '90'],

    ['plain', 'But the internet is where the following lives',
     `The people who might follow you are all over the world. The people who can rent your machine live about twenty minutes away. Those are two completely different jobs and the website has to do both.`],
  ],
},
{
  name: 'Riding what is already happening',
  colour: '#ffb74d',
  blurb: 'You do not have to invent everything from scratch.',
  cards: [
    ['plain', 'Use the sound everyone is already using',
     `If there is a sound or a format going around, do your version with something only you have — the machine, the garnish, the van, the arguing.`],

    ['plain', 'Be fast, not perfect',
     `A trend is worth something for about a week. A rough video posted on day two beats a beautiful one posted three weeks later.`],

    ['plain', 'Only ride the ones that fit',
     `If you have to explain why your business is in the video, it is the wrong trend. Skip it and wait. There is always another one.`],
  ],
},
  ],
},

/* ======================= 4. THE TWO KINDS OF DRINKS ====================== */
{
  slug: 'two-kinds-of-drinks',
  title: 'Two kinds of drinks',
  kicker: 'The product idea',
  lede: `An idea about making a second, better version of the mix — with real fruit instead of syrup. Nothing here is decided and nothing has been built. Read the warning at the bottom before anyone starts.`,
  close: [
    ['Test it at home first. Really.',
     `Frozen drink machines need sugar to freeze properly. A low-sugar mix can freeze solid and fight the machine. Getting that wrong in front of somebody who paid would cost more than the whole idea is worth. Getting it right first is the thing nobody else can copy quickly.`],
  ],
  groups: [
{
  name: 'The idea',
  colour: '#81c784',
  blurb: 'Same machine, same van, different mix.',
  cards: [
    ['plain', 'Everyone uses the same syrup',
     `Every margarita machine company in Austin uses the same bulk mix: corn syrup, citric acid, artificial colour, "natural and artificial flavour." It is fine. It is also exactly the ingredient list a lot of people around here read labels to avoid.`],

    ['plain', 'So squeeze actual limes',
     `Real citrus, real fruit, agave instead of syrup. It costs maybe $30 to $50 more per party, and it is worth a lot more than that — because what is being sold is not limes, it is <i>made this morning, by hand</i>.`],

    ['plain', 'And a version with no dye at all',
     `The thing that makes blue raspberry blue is exactly the thing plenty of parents avoid. Nobody in this business offers an alternative. Colour from real fruit only.`],

    ['plain', 'Why a big competitor cannot copy it',
     `Anyone can buy a machine. Squeezing limes is <b>work</b>, not equipment. A company with six machines and a warehouse cannot start doing it without changing everything about how they operate. Two sisters and a citrus press can start on Saturday.`],
  ],
},
{
  name: 'The filming is better than the drink',
  colour: '#ba68c8',
  blurb: 'Making it is far better content than serving it.',
  cards: [
    ['plain', 'Read the other lot’s ingredients out loud',
     `Slowly. That one video is the entire argument and it makes itself.`],

    ['plain', 'Squeeze a hundred limes',
     `Satisfying, ridiculous, and obviously real work. This is the shot that proves the whole claim.`],

    ['plain', 'Get the recipe wrong on camera, repeatedly',
     `Too sour. Too sweet. Too thin. Getting it wrong several times is better to watch than getting it right once, and it is genuinely how recipes get made.`],

    ['plain', 'The freeze test',
     `Find out how little sugar you can use before the machine gives up. That is real science with a real answer, and it is the kind of thing a teacher would show a class.`],

    ['plain', 'What you do not film',
     `The tequila. You make the mix and that is your recipe and your work. The grown-up part is a line on a piece of paper handed over at setup — never a video, never a page.`],
  ],
},
  ],
},
];

/* ------------------------------------------------------------------ render */

const esc = s => s.replace(/&(?!#?\w+;)/g, '&amp;');

const card = (c) => {
  const kind = c[0];
  if (kind === 'debate') {
    const [, title, pro, con, land] = c;
    return `<article class="card debate">
  <div class="slush"></div>
  <div class="body">
    <h3>${esc(title)}</h3>
    <div class="side"><span class="tag yes">One side</span><p>${esc(pro)}</p></div>
    <div class="side"><span class="tag no">Other side</span><p>${esc(con)}</p></div>
    <div class="side land"><span class="tag mid">Where it lands</span><p>${esc(land)}</p></div>
  </div>
</article>`;
  }
  if (kind === 'number') {
    const [, title, big, body] = c;
    return `<article class="card">
  <div class="slush"></div>
  <div class="body">
    <p class="big">${esc(big)}</p>
    <h3>${esc(title)}</h3>
    ${body ? `<p>${esc(body)}</p>` : ''}
  </div>
</article>`;
  }
  const [, title, body] = c;
  return `<article class="card">
  <div class="slush"></div>
  <div class="body">
    <h3>${esc(title)}</h3>
    <p>${esc(body)}</p>
  </div>
</article>`;
};

const STYLE = `<style>
@font-face{font-family:'Sour Gummy';font-weight:800;font-display:swap;src:url(data:font/ttf;base64,${SOUR}) format('truetype');}
:root{
  --ground:#eef6fd; --panel:#ffffff; --ink:#16203f; --soft:#5d6b8c;
  --brand:#1a237e; --ice:#4fc3f7; --line:#d6e6f5;
  --shadow:0 2px 0 rgba(22,32,63,.06), 0 10px 30px rgba(26,35,126,.08); --on-brand:#ffffff;
}
@media (prefers-color-scheme: dark){
  :root{ --ground:#0d1338; --panel:#161f4d; --ink:#e9f2fb; --soft:#9fb2d4;
         --brand:#4fc3f7; --line:#28336b;
         --shadow:0 2px 0 rgba(0,0,0,.2), 0 10px 30px rgba(0,0,0,.3); --on-brand:#0d1338; }
}
:root[data-theme="dark"]{ --ground:#0d1338; --panel:#161f4d; --ink:#e9f2fb; --soft:#9fb2d4;
  --brand:#4fc3f7; --line:#28336b; --shadow:0 2px 0 rgba(0,0,0,.2), 0 10px 30px rgba(0,0,0,.3); --on-brand:#0d1338; }
:root[data-theme="light"]{ --ground:#eef6fd; --panel:#ffffff; --ink:#16203f; --soft:#5d6b8c;
  --brand:#1a237e; --line:#d6e6f5; --shadow:0 2px 0 rgba(22,32,63,.06), 0 10px 30px rgba(26,35,126,.08); --on-brand:#ffffff; }

*{box-sizing:border-box;}
body{margin:0;background:var(--ground);color:var(--ink);
  font-family:'DM Sans',system-ui,sans-serif;font-weight:500;line-height:1.6;
  -webkit-text-size-adjust:100%;}
h1,h2,h3{font-family:'Sour Gummy',system-ui,sans-serif;font-weight:800;margin:0;text-wrap:balance;line-height:1.08;}
p{margin:0;}
a{color:inherit;}

.wrap{max-width:1120px;margin:0 auto;padding:0 20px 88px;}
.wrap.top{padding-bottom:0;}

.back{display:inline-flex;align-items:center;gap:7px;margin-top:26px;
  font-weight:700;font-size:.84rem;color:var(--soft);text-decoration:none;
  border:1.5px solid var(--line);background:var(--panel);border-radius:999px;padding:9px 16px;}
.back:hover{border-color:var(--ice);color:var(--ink);}

.hero{padding:34px 0 34px;display:flex;flex-direction:column;gap:16px;}
.eyebrow{font-weight:700;font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ice);}
.hero h1{font-size:clamp(2.2rem,7vw,4.2rem);color:var(--brand);}
.hero .lede{font-size:clamp(1rem,2.2vw,1.18rem);color:var(--soft);max-width:58ch;}

.group{margin-bottom:52px;}
.group-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;
  padding-bottom:12px;margin-bottom:20px;border-bottom:3px solid var(--c);}
.group-head h2{font-size:clamp(1.35rem,3.4vw,1.95rem);color:var(--ink);}
.group-head p{color:var(--soft);font-size:.92rem;flex:1 1 240px;}

.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:16px;}

.card{background:var(--panel);border:1.5px solid var(--line);border-radius:16px;
  overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--shadow);}
.slush{height:16px;background:var(--c);
  -webkit-mask:radial-gradient(9px at 9px 100%,#0000 98%,#000) repeat-x 0 100%/18px 12px;
  mask:radial-gradient(9px at 9px 100%,#0000 98%,#000) repeat-x 0 100%/18px 12px;}
.body{padding:16px 18px 18px;display:flex;flex-direction:column;gap:9px;flex:1;}
.card h3{font-size:1.06rem;letter-spacing:-.01em;line-height:1.25;}
.card p{font-size:.92rem;color:var(--soft);line-height:1.62;}
.card b{color:var(--ink);font-weight:700;}
.big{font-family:'Sour Gummy',system-ui,sans-serif;font-weight:800;
  font-size:clamp(2.2rem,6vw,3rem);color:var(--ice);line-height:1;
  font-variant-numeric:tabular-nums;}

.debate .side{border-top:1.5px solid var(--line);padding-top:10px;display:flex;flex-direction:column;gap:5px;}
.debate .side.land{border-top-width:3px;border-top-color:var(--ice);}
.tag{font-weight:700;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;
  align-self:flex-start;padding:3px 9px;border-radius:999px;border:1.5px solid var(--line);color:var(--soft);}
.tag.mid{background:var(--ice);border-color:var(--ice);color:var(--on-brand);}

.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:16px;margin-top:8px;}
.tile{display:flex;flex-direction:column;background:var(--panel);border:1.5px solid var(--line);
  border-radius:16px;overflow:hidden;box-shadow:var(--shadow);text-decoration:none;transition:.16s;}
.tile:hover{transform:translateY(-2px);border-color:var(--ice);}
.tile .body{gap:7px;}
.tile h3{font-size:1.18rem;color:var(--brand);}
.tile .go{margin-top:auto;padding-top:10px;font-weight:700;font-size:.82rem;color:var(--ice);}

footer{border-top:1.5px solid var(--line);padding-top:22px;display:flex;flex-direction:column;gap:16px;}
footer .fi b{display:block;color:var(--ink);font-family:'Sour Gummy',sans-serif;font-weight:800;
  font-size:1.02rem;margin-bottom:4px;}
footer .fi p{color:var(--soft);font-size:.9rem;}

@media (prefers-reduced-motion: reduce){*{transition:none!important;}}
@media (max-width:520px){ .grid,.tiles{grid-template-columns:1fr;} .hero{padding:26px 0 26px;} }
</style>`;

const shell = (title, inner) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#1a237e">
<title>${esc(title)}</title>
${STYLE}
</head>
<body>
${inner}
</body>
</html>`;

const outDir = process.argv[2] || 'public/read';
fs.mkdirSync(outDir, { recursive: true });

let written = 0, cardCount = 0;

for (const page of PAGES) {
  const groups = page.groups.map(g => {
    cardCount += g.cards.length;
    return `<section class="group">
  <header class="group-head" style="--c:${g.colour}">
    <h2>${esc(g.name)}</h2>
    <p>${esc(g.blurb)}</p>
  </header>
  <div class="grid" style="--c:${g.colour}">
${g.cards.map(card).join('\n')}
  </div>
</section>`;
  }).join('\n\n');

  const inner = `<div class="wrap top">
  <a class="back" href="/read">&larr; All of them</a>
  <div class="hero">
    <p class="eyebrow">${esc(page.kicker)}</p>
    <h1>${esc(page.title)}</h1>
    <p class="lede">${esc(page.lede)}</p>
  </div>
</div>

<div class="wrap">
${groups}

  <footer>
${page.close.map(([h, b]) => `    <div class="fi"><b>${esc(h)}</b><p>${esc(b)}</p></div>`).join('\n')}
  </footer>
</div>`;

  fs.writeFileSync(path.join(outDir, page.slug + '.html'),
                   shell(`${page.title} — Slush Sisters`, inner));
  written++;
}

/* --------------------------------------------------------------- the hub */

const tiles = PAGES.map(p => `<a class="tile" href="/read/${p.slug}">
  <div class="slush" style="--c:${p.groups[0].colour}"></div>
  <div class="body">
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.lede.split('. ').slice(0, 2).join('. '))}${p.lede.split('. ').length > 2 ? '.' : ''}</p>
    <p class="go">Read it &rarr;</p>
  </div>
</a>`).join('\n');

const hub = `<div class="wrap top">
  <div class="hero">
    <p class="eyebrow">Finley &amp; Harper &middot; Slush Sisters LLC</p>
    <h1>Everything anyone<br>worked out about<br>your business.</h1>
    <p class="lede">Grown-ups keep writing long documents about this company. These are the same documents, for the two people who actually own it. Nothing has been left out to make it simpler — it is just written properly.</p>
  </div>
</div>

<div class="wrap">
  <div class="tiles">
${tiles}
    <a class="tile" href="/ideas">
      <div class="slush" style="--c:#ffb74d"></div>
      <div class="body">
        <h3>The idea board</h3>
        <p>Every idea anyone has had, on cards. Pick one and go and do it.</p>
        <p class="go">Open it &rarr;</p>
      </div>
    </a>
  </div>

  <footer style="margin-top:52px">
    <div class="fi"><b>Nobody else can see these.</b><p>These pages are not linked from the website, they are not in Google, and search engines are told to ignore them. You get here because somebody sent you the link.</p></div>
    <div class="fi"><b>You are allowed to disagree with any of it.</b><p>It is your company. Everything in here is somebody's opinion, and some of it is going to turn out to be wrong. Working out which bits is the actual job.</p></div>
  </footer>
</div>`;

fs.writeFileSync(path.join(outDir, 'index.html'), shell('The reading room — Slush Sisters', hub));
written++;

console.log(`wrote ${written} pages to ${outDir}/ — ${cardCount} cards`);
