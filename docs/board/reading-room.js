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

/* ====================== 0. PICK THE COLOURS ============================== */
{
  slug: 'pick-the-colours',
  title: 'Pick the colours',
  kicker: 'Your decision',
  lede: `You said you wanted more pink. A designer worked out four ways to do it and measured every single one, so all four actually work — nobody is going to tell you your favourite is wrong. Look at them on your phone and pick a letter.`,
  close: [
    ['Why you cannot have the brightest pink in the writing',
     `A really bright pink on a white background is too pale to read — that is measured, not an opinion. So bright pink is for buttons, big words and shapes, and a deeper raspberry pink does the small writing. <b>Except at night.</b> On a dark background the bright pink works perfectly, which is why the dark version of every one of these is where your pink looks best.`],
    ['One more thing, and it is the whole point',
     `Somebody who studies brands said the strongest thing about picking your own colours is that <i>you</i> picked them. A colour chosen by a grown-up consultant does not prove two kids run this company. A colour chosen by Harper does. But only if we say so on the website — so whichever you pick, we are going to write one line: <b>"Harper picked the pink."</b>`],
  ],
  groups: [
{
  name: 'The four ways to do it',
  colour: '#ff4081',
  blurb: 'Each box below is a tiny version of the real website in those colours. Same words, same buttons, same price — only the colours change.',
  cards: [
    ['palette', 'A', 'Two Tanks', 'Pink and blue, equal partners. The reason: your machine has two tanks. Two sisters, two tanks, two colours. It is the only one where the colours mean something true about the business.',
     'It is the smallest change. It looks like a tidy-up rather than something new.',
     {ground:'#fdf2f7', panel:'#ffffff', ink:'#171f4d', soft:'#5b6690', brand:'#cd1c73', line:'#f2d9e6', 'on-brand':'#ffffff'}],

    ['palette', 'B', 'Raspberry First', 'Pink runs everything and blue almost disappears. Every other frozen drink company in Austin is blue or red or green. Not one is pink. You would be the only one.',
     'You lose the blue, and blue is how a cold drink says "cold" without using a word.',
     {ground:'#fff3f8', panel:'#ffffff', ink:'#3a1027', soft:'#8a5570', brand:'#c2185b', line:'#f7d7e5', 'on-brand':'#ffffff'}],

    ['palette', 'C', 'Sorbet', 'The paper is pink instead of the writing. The whole page glows pink from across a room, and every word on it is a deep dark plum so it is easy to read.',
     'Every photo of you two sits on a pink background forever, and every screenshot anyone takes is pink.',
     {ground:'#fbe6ee', panel:'#ffffff', ink:'#2b1231', soft:'#6f4a63', brand:'#b0165f', line:'#f0c9da', 'on-brand':'#ffffff'}],

    ['palette', 'D', 'Neon Ice', 'Dark background, bright neon pink writing. This is the only one where you get the actual brightest pink in the words, because on a dark background it finally works.',
     'It looks odd next to sunny photos of a pool party, and dark shirts cost more and show every bit of fluff.',
     {ground:'#120a24', panel:'#1d1033', ink:'#f7ecff', soft:'#b6a0cc', brand:'#ff4fa3', line:'#33204f', 'on-brand':'#1a0410'}],
  ],
},
{
  name: 'Things worth knowing before you pick',
  colour: '#4fc3f7',
  blurb: 'None of these should change your mind. They are just true.',
  cards: [
    ['plain', 'The Book button was broken and pink fixes it',
     `The blue button with white writing on it was too pale to read properly — it has been like that the whole time, on every page. Every single pink here works as a button. So the pink you want and the version that actually works are the same change.`],

    ['plain', 'Pink was a boys’ colour first',
     `In 1918 a magazine for baby shops told people pink was for boys, because it was "a decided and stronger color", and blue was for girls. In 1927 six big shops said pink for boys and four said pink for girls. The whole pink-for-girls thing is about seventy years old. It is a habit, not a fact.`],

    ['plain', 'Our letters have a slashed zero and it is stuck',
     `The font we use puts a line through the middle of every 0. So $250 has a line through it, always, and there is no way to switch it off. It makes prices look like computer code. If you want that fixed, the font has to change too — that is a separate decision and it can wait.`],

    ['plain', 'Whatever you pick works in the dark too',
     `Every one of these has a night-time version built in, and that is also the grown-up version. Your pink at a December work party is the same pink — just at night. That means we never need a boring second version of your brand for adults.`],
  ],
},
  ],
},

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

/* ========================= 3. THE SCIENCE OF FREEZING ==================== */
{
  slug: 'why-it-freezes',
  title: 'Why it freezes',
  kicker: 'The recipe lab',
  lede: `The real science of what is in the tank. This is the part you can own completely — nobody else renting a machine in Austin knows any of it, and it decides whether the fancy version of your mix is even possible.`,
  close: [
    ['Buy the thing that measures it. It costs about $30.',
     `A refractometer. Two drops on the glass, hold it to the light, read the line. Nobody has ever measured the mix that is already in your garage — so right now every number in this business is a guess. That is the first experiment and it takes ten minutes.`],
    ['Do not wreck the machine finding out.',
     `Go from lots of sugar downwards, never the other way, one batch at a time. Record the motor on a phone. If the sound changes pitch, switch to chill mode straight away and let it thaw. A thawed tank costs an hour. A seized machine costs the business.`],
  ],
  groups: [
{
  name: 'The one idea everything rests on',
  colour: '#4fc3f7',
  blurb: 'Sweet and frozen are two completely different jobs. Most people never notice.',
  cards: [
    ['plain', 'Sugar is not really the sweetener. It is the antifreeze.',
     `The reason a slushie is slushy instead of a solid lump is the sugar in it. Dissolved things lower the temperature water freezes at. Take the sugar out and you do not get a healthier slushie — you get an ice cube.`],

    ['plain', 'Freezing power depends on the <i>size</i> of the molecule, not the taste',
     `Small molecules lower the freezing point more, gram for gram. That is why two things can be equally sweet and behave completely differently in the tank. Sweetness and freezing are unrelated. They only travel together in ordinary sugar because that is what everyone is used to.`],

    ['sortable', 'Sort this table two ways',
     `Tap "Freezing power," then tap "Sweetness." The order changes completely — and that is the whole point. Salt has no sweetness at all and nearly six times sugar's freezing power. Sucralose is hundreds of times sweeter than sugar and does almost nothing to the freezing point.`,
     ['Sweetener', 'Freezing power', 'Sweetness'],
     [['Table sugar', 100, 100],
      ['Glucose', 190, 70],
      ['Fructose (agave)', 190, 170],
      ['Allulose', 190, 70],
      ['Honey', 146, 94],
      ['Lactose', 100, 16],
      ['Salt', 585, 0],
      ['Alcohol', 740, 0],
      ['Sucralose', 1, 60000]]],

    ['plain', 'So the sugar-free one really would be a block',
     `Stevia, monk fruit and sucralose are so sweet that you only use a tiny pinch. A tiny pinch of anything cannot lower the freezing point. It would taste sweet and freeze rock solid. That is a real prediction you can test — and filming it failing is better content than filming it working.`],

    ['plain', 'But the agave one might be too <i>soft</i>, which nobody expected',
     `Agave is mostly fructose, which has nearly twice sugar's freezing power. So you would use less of it <b>and</b> each gram does more. The grown-up documents have been warning for months that the fancy low-sugar version would freeze too hard. It might do the opposite. Nobody has checked.`],
  ],
},
{
  name: 'Try the freeze test before you run it',
  colour: '#e57373',
  blurb: 'Brix is just a number for how much sugar is dissolved in something.',
  cards: [
    ['brix', 'Drag the sugar up and down',
     `This is what the real experiment will look like. Somewhere around 11 the machine stops making slush and starts making a brick — and that point is exactly what you are trying to find.`],

    ['plain', 'Three different sources disagree about the right number',
     `One says 13 to 15. A machine manual says 13 to 17. Another says 21 to 24. They cannot all be right about your machine. This is not a problem — it is the first experiment, and it is free once the refractometer arrives.`],
  ],
},
{
  name: 'Clever tricks',
  colour: '#81c784',
  blurb: 'Ways round problems that do not need any new equipment.',
  cards: [
    ['plain', 'Make it taste less sweet without taking sugar out',
     `Sour and sweet cancel each other out. Add a bit more acid — lemon, lime, citric acid — and the same amount of sugar tastes less sweet. So you fix "too sweet" while keeping the sugar that makes it freeze properly. This is the single most useful trick on this page.`],

    ['plain', 'Put the sour on the rim instead',
     `Even better: put the sour powder on the <i>rim</i> of the cup rather than in the mix. Then it cannot affect the freezing at all, because it never goes in the tank.`],

    ['plain', 'A drink that changes colour in the cup',
     `Butterfly pea flower makes a deep blue tea. Add lemon and it turns pink-purple, in front of whoever is holding it. No artificial colour at all. It is also the answer to the hardest problem on the menu — blue raspberry is a flavour, not a fruit, so there is nothing naturally blue to make it out of.`],

    ['plain', 'Which natural colours actually survive a party',
     `Hibiscus, black carrot and purple sweet potato all like sour drinks and hold their colour. Beetroot does not — it wants a much less sour drink and fades in sunlight. Turmeric is fine in sour but fades in light too. Cold helps a lot: colour lasts almost twice as well in a cold drink as a warm one.`],

    ['plain', 'Give the grown-ups a card that says how much to add',
     `The most likely way a rental goes wrong is a dad tipping a whole bottle of tequila in, and then it never freezes. Alcohol is an even stronger antifreeze than salt. A little printed card saying how much per tank protects the machine and makes you look like you know exactly what you are doing. Which you would.`],
  ],
},
  ],
},

/* =================== 4. WHAT OTHER KID BUSINESSES DID ==================== */
{
  slug: 'other-kids-businesses',
  title: 'What happened to other kids',
  kicker: 'The research',
  lede: `Somebody went and studied real businesses run by kids — what they posted, what worked, what flopped, and what they actually earned. Some of it is encouraging. Some of it is not, and those are the useful bits.`,
  close: [
    ['The uncomfortable number',
     `A boy in Canada made a video about cleaning bins that got 1.7 million likes. His business made about five hundred dollars. Those two facts are both true and they are not connected. Being famous online and making money are separate things, and one does not automatically turn into the other.`],
    ['What that does not mean',
     `It does not mean do not bother. It means be honest about what the videos are for. They are not a machine that turns views into parties. If a big audience is going to be worth something, there has to be something to sell them — and right now there is not one. That is a thing to build, not a thing to hope for.`],
  ],
  groups: [
{
  name: 'The most important thing they found',
  colour: '#e57373',
  blurb: 'Views and money are two separate things.',
  cards: [
    ['plain', 'Ashton, 11, cleans bins in Canada',
     `He knocked on doors asking if people wanted their bins cleaned for $10. One video got <b>1,709,577 likes</b>. He has 117,500 followers. His business has earned around <b>$500</b>, from 30 to 40 customers.`],

    ['plain', 'Milla, 11, sells 3D printed toys',
     `More than 75,000 followers and a video with 1.3 million views. Her shop has sold 712 things in four months, mostly between $5 and $30. That is real and it is growing fast — and it is nowhere near what 75,000 followers sounds like it should be worth.`],

    ['plain', 'Why this matters for you specifically',
     `Someone in Ohio can watch every video you ever make and still never rent your machine, because your van does not go to Ohio. A huge audience is worth almost nothing to a business that only delivers within about thirty miles. Nobody knows yet how many of your followers live close enough to book.`],
  ],
},
{
  name: 'The one about a numbered series',
  colour: '#ffb74d',
  blurb: 'Two kids did the same thing. One went up 245 times. One fell 99.7%. The difference is tiny.',
  cards: [
    ['plain', 'Ashton went UP',
     `"Day 2 of going door to door asking people if they want me to clean their garbage bins" got 6,959 likes. <b>"Day 7"</b> of exactly the same thing got <b>1,709,577</b>. Same words, same idea, just a bigger number in front.`],

    ['plain', 'Milla went DOWN',
     `Her "day in the life" series: part 9 got 1.3 million views. Part 14 got 41,000. <b>Part 16 got 4,500.</b> Almost everyone stopped watching.`],

    ['debate', 'So what was different?',
     `Ashton kept the exact same title every single time. Only the number changed. People knew instantly what they were getting and came back for the next one.`,
     `Milla changed her title four times while the series was running — "a day in life", then "a day in the life", then "my routine", then "a summer day in the life". Maybe the titles had nothing to do with it and the videos just got less interesting.`,
     `Nobody can prove the renaming caused it. But it is free to get right and expensive to get wrong. Pick the exact words for your series, write them down, and never change them. Change the number, nothing else.`],
  ],
},
{
  name: 'Things worth copying',
  colour: '#81c784',
  blurb: 'All four of these are free.',
  cards: [
    ['plain', 'Film the times people say no',
     `The single best-performing thing in the whole study is a boy being politely turned down at a door. He cried the first time someone said no, and that is in the news stories about him. Getting rejected is the content. So is the party that got rained off and the batch that froze wrong.`],

    ['plain', 'Put "run by our mum" in the bio',
     `The most successful account in the study writes "parent-run account" right in the bio, twice, without being asked. It answers the awkward question before anyone can ask it — and it makes other accounts comfortable sharing your videos.`],

    ['plain', 'Put the story first, the shop second',
     `Milla's link list starts with "Our Full Story" and the shop is only second. People arrive curious about the person, not the product.`],

    ['plain', 'Add the younger sister as the older one grows up',
     `A hair-accessory business run by a 9-year-old added her little sister as she got older, so the business kept going as she stopped being the cute one. You already have that built in.`],
  ],
},
{
  name: 'Things to be careful about',
  colour: '#ba68c8',
  blurb: 'Two of these are genuinely worth knowing before anything gets big.',
  cards: [
    ['plain', 'A girl’s lemonade business got shut down for being too successful',
     `Pretty Paws Lemonade grew from a stand outside her house to markets all over Las Vegas. Then somebody complained anonymously to the health department and it was closed down for not having a licence. She was allowed to give lemonade away free, just not sell it. <b>Getting popular is what put her on their desk.</b>`],

    ['plain', 'Posting a lot is not the same as posting well',
     `One account posted 430 times and has 3,400 followers. Ashton got 117,500 followers from <b>27 posts</b>. Doing more is not the answer. Doing the same good thing repeatedly is.`],

    ['plain', 'The famous kid grew up',
     `A boy went viral for crochet at 11 in 2019. He now has 448,000 followers — and a recent post got 1,200 likes. The followers stayed and the interest went. He is going to the army, then college, then medical school. Being a talented kid stops being the interesting part, and that is fine, but it is worth planning for.`],

    ['plain', 'Every one that lasted did the same thing',
     `Mikaila Ulmer, Alina Morse, Moziah Bridges, Zandra Cunningham. All started as kids, all still going. Every single one ended up with a <b>product in shops</b> — something in a box that gets sold whether or not they are standing there. None of them stayed "the kid business."`],
  ],
},
{
  name: 'What nobody knows yet',
  colour: '#64b5f6',
  blurb: 'Tick these off as you find them out. Every one is cheap.',
  cards: [
    ['unknown', 'What is actually in our mix?', 'Free · 20 minutes',
     `Read the ingredients on the tub in the garage. There is an ingredient called glycerol that some slushie mixes use, and a food safety agency in Britain says drinks containing it are not suitable for children under 7. If ours does not have it, that is the best thing we could possibly put on the website. If it does, we need to know.`],

    ['unknown', 'How many of our followers live near enough to book?', 'Free · 20 posts',
     `The account can tell you where people are. That one number decides whether the videos are advertising or something else entirely.`],

    ['unknown', 'Do customers even remember the candy?', 'Free · one evening',
     `Text the last ten people who booked and ask what their guests talked about. Do not use the word candy — see if they say it themselves.`],

    ['unknown', 'What is the Brix of the mix we already have?', '$30 · 10 minutes',
     `Nobody has ever measured it. Every other number in the business depends on it.`],

    ['unknown', 'How many cups does one party actually use?', 'Free · 6 parties',
     `A tally sheet in the van. Nobody has counted, so nobody knows what a party really costs.`],

    ['unknown', 'Does the money content really beat the drink content?', 'Free · 10 posts',
     `Everyone keeps saying it does. Five of each, same two weeks, then compare. Until then it is just a thing people say.`],

    ['unknown', 'Would anyone pay more for fresh-squeezed?', 'Free · 5 texts',
     `Ask five people who have already booked. They are the only people whose opinion has been tested with actual money.`],
  ],
},
  ],
},

/* ====================== 5. HOW PEOPLE FIND OUT ABOUT YOU ================= */
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

/* ================= 5. A DRINK AS GOOD AS A BAR MAKES ===================== */
{
  slug: 'as-good-as-a-bar',
  title: 'As good as a bar',
  kicker: 'The recipe',
  lede: `Somebody who builds frozen drinks for actual bars worked out whether you could make one that stands next to theirs. You can. And it turns out the hardest part of the job is the one part you already do not have to do.`,
  close: [
    ['The lucky bit is not luck, it is the rule you already follow.',
     `Grown-ups add the tequila at the party, not you. That rule was there to keep you out of the alcohol. It also happens to hand you the cleanest measurement in the whole business — and most bars would love to have it.`],
    ['None of this works until somebody measures the syrup.',
     `Every number on this page depends on knowing how sweet our syrup already is. Nobody has ever measured it. That is one afternoon with a refractometer and it unlocks the rest.`],
  ],
  groups: [
{
  name: 'The number you are aiming at',
  colour: '#4fc3f7',
  blurb: 'There is one right answer and a fairly narrow window around it.',
  cards: [
    ['number', 'How sweet the finished drink should be', '13.5',
     `Thirteen and a half Brix. Below about 12 it freezes so hard the machine's screw strains and can stall. Above about 16 it never sets and you have handed somebody a cold drink instead of a frozen one. 13.5 sits in the middle with room on both sides for a hot day.`],

    ['number', 'So build the mix to this', '16.9',
     `The grown-up's tequila waters the mix down by about a fifth. So the mix you make has to start sweeter than the drink ends up. Multiply your mix by 0.8 and you get the finished drink. Work it backwards: 13.5 divided by 0.8 is 16.9. That is the number on the recipe card.`],

    ['number', 'And the alcohol has to stay under', '9%',
     `Alcohol fights freezing about seven and a half times harder than sugar does, gram for gram. Past roughly 9% in the finished drink there is no amount of sugar fiddling that saves it — it just will not freeze. That is a number to hand the grown-up doing the pouring.`],

    ['plain', 'Salt is a very short lever',
     `Salt pushes the freezing point down about <b>eleven times</b> harder than sugar does, gram for gram. A quarter teaspoon across the whole tank is a real change. Salt on the rim of the cup is free and lovely. Salt <i>in</i> the mix is something to test carefully before it goes near a customer.`],
  ],
},
{
  name: 'The thing that makes you better at this than a bar',
  colour: '#81c784',
  blurb: 'This is the best fact anyone found today.',
  cards: [
    ['plain', 'Measuring sugar in alcohol is really hard. You never have to.',
     `A refractometer works by bending light through the liquid. Alcohol bends light differently than sugar does, so in an alcoholic mix the reading comes out wrong and you need correction tables or a second instrument to fix it. It is the fiddliest part of batching frozen cocktails. <b>You only ever handle the mix before the tequila goes in.</b> So there is no alcohol in what you measure. Your number is just the number. No correction, no tables, no guessing.`],

    ['plain', 'What a machine drink actually is',
     `A blender margarita is ice plus liquid, whizzed up. A machine margarita is <b>a blender margarita with the ice already melted into it</b>. Everything that makes a blender drink go watery and grainy after twenty minutes is the ice melting. You do not have ice. That is why yours is still good an hour later, and it is worth saying out loud.`],

    ['plain', 'The machine temperature matters as much as the recipe',
     `A mix that is perfect at one setting is soup at another. So a recipe is not finished when the ingredients are written down — it is finished when the machine setting is written down next to them. Any recipe we publish has to say both, or nobody can actually repeat it.`],
  ],
},
{
  name: 'What the fancy version costs',
  colour: '#ffb74d',
  blurb: 'Less than anyone guessed.',
  cards: [
    ['number', 'Extra ingredients, per party', '$20–40',
     `That is the whole difference between bulk syrup and real squeezed citrus. Not $200. Twenty to forty dollars. Which means whether to do it is a decision about what to charge, not a decision about whether it is affordable.`],

    ['number', 'Limes you have to squeeze, using the trick', '≈7',
     `There is a bartender technique called <b>super juice</b>: you use the peels plus two acids you can buy in a tub, and you get the same sourness and the same lime smell out of about seven limes that would normally take fifty. Same drink. An eighth of the squeezing and an eighth of the grocery bill.`],

    ['debate', 'So should you squeeze fifty limes on camera anyway?',
     `Fifty limes in a bucket is the best thing you could possibly film. It looks like exactly what it is — obvious, ridiculous, real work — and it is the entire argument for the fancy version in one shot.`,
     `Seven limes makes the same drink for an eighth of the money. Squeezing fifty every single Saturday because it films well is doing hard work for a camera instead of for a customer.`,
     `Film the fifty <b>once</b>. That video lasts forever. Then use the seven-lime trick every weekend after that, and say so — "we found a better way" is a good second video, not a confession.`],
  ],
},
  ],
},

/* ==================== 6. WHAT DO WE EVEN CALL IT? ======================== */
{
  slug: 'what-do-we-call-it',
  title: 'What do we call it?',
  kicker: 'The name argument',
  lede: `Someone whose whole job is naming things looked at whether you could invent a brand new kind of business. Their answer was no — and then they explained something better you can do instead. Nothing here is decided. Two of you have to be able to say it out loud first.`,
  close: [
    ['You get to kill this one.',
     `A name only works if the person saying it is you. If either of you feels silly saying "the everybody bar" to a grown-up in a driveway, it is the wrong name and we bin it. That is not being polite — that is genuinely how names fail.`],
    ['And there is a rule for finding out.',
     `After twenty parties, listen to how customers describe you to their friends. If they still say "the margarita machine people", the name did not take and we drop it. You can suggest what people call you. You cannot make them.`],
  ],
  groups: [
{
  name: 'What everyone else is doing',
  colour: '#e57373',
  blurb: 'Two of these were a surprise and one of them is a bit worrying.',
  cards: [
    ['plain', 'Two tanks is not actually special',
     `We have been treating the two tanks as our big secret. One company in Austin already rents a two-tank machine for $350. So it is not a secret — plenty of people have it. It is still worth saying loudly, because most customers do not know two-tank machines exist. But it is not a moat.`],

    ['plain', 'Here is what nobody is doing though',
     `That same company lists five flavors and <b>every single one is a grown-up drink</b>. Two tanks, two adult drinks. Nobody has said the obvious thing: the second tank should be the kids'. The gap is not the machine. The gap is what people do with it.`],

    ['number', 'And this one is a real threat', '$269.99',
     `A company called Ninja sells a home slush machine for $269.99, and about 91,000 people a month look it up. For a small party, buying one now costs about the same as renting from you once. That floor is rising, and the answer is not to be cheaper — it is to be something a countertop machine cannot be.`],

    ['sortable', 'Us against the ones we know about',
     'Tap a heading to sort. The one column where nobody else scores is the one worth building on.',
     ['Who', 'Price', 'Tanks', 'Kid flavors'],
     [
       ['Slush Sisters', 250, 2, 'yes'],
       ['ATX Marg Rentals', 350, 2, 'no'],
       ['Ninja SLUSHi (buy it)', 270, 1, 'yes'],
     ]],
  ],
},
{
  name: 'The two names',
  colour: '#ba68c8',
  blurb: 'One is what the business is. The other is what a customer repeats to a friend. They do different jobs.',
  cards: [
    ['plain', 'The everybody bar',
     `That is the whole thing in two words: one machine, one price, and nobody standing at your party drinking something they did not want. It says what is different without listing a single feature.`],

    ['plain', 'The kids’ tank',
     `This is the bit somebody actually repeats. Short, you can picture it, and it explains itself with no help. If only one of these two survives, it should be this one.`],

    ['plain', 'The rule that protects the money',
     `Six of our pages exist only to be found by people typing "margarita machine rental" into Google — about 900 people a month. <b>Those pages never change.</b> A new name goes on the front page and the pages people read once they have already found us. Swap the words on the Google pages and we lose the 900 and gain a phrase nobody is searching for.`],

    ['debate', 'Should you invent a completely new kind of business?',
     `If you name the category, you own it. Everyone else becomes a copy of you, and you never have to compete on price again.`,
     `Nobody in Lakeway is Googling a word you made up. Inventing a category means teaching people a new word <i>and</i> selling to them at the same time — that is two hard jobs, and the searches you already have are the actual business.`,
     `Not a new category. A new <b>corner</b> of the existing one, with your rules written down in public. You keep the words people search for, and you add something they cannot search for because only you do it.`],
  ],
},
{
  name: 'Writing your rules down where everyone can see them',
  colour: '#4fc3f7',
  blurb: 'Nine rules. The test for whether a rule belongs on the list is unusual.',
  cards: [
    ['plain', 'A rule only counts if copying it is hard',
     `Anyone can add a sentence to their website. So a rule like "we care about quality" is worth nothing — a competitor matches it in ten seconds. A rule like "we publish the sugar reading and the machine temperature for every recipe" costs them real work to match, or they visibly do not match it. Every rule on the list has to cost something.`],

    ['plain', 'The strongest four so far',
     `A measured sugar number for every recipe. The machine temperature written next to it. A version with no artificial dye. The full ingredient list published, all of it, nothing left out.`],

    ['plain', 'You cannot hand out badges, and that is the law',
     `The first idea was a badge other companies could earn. It turns out there is an actual American law about this: whoever hands out that kind of badge is <b>not allowed to sell the thing the badge is for</b>. So Slush Sisters could certify everybody else's margarita machines — but then Slush Sisters could not rent one. Publishing your own rules under your own name does the same job, is free, and is legal.`],

    ['unknown', 'Can you both say the name out loud without laughing?',
     'Costs nothing. Takes five minutes.',
     `Try it on each other. Then try it on a grown-up who does not know about any of this. If it comes out easily, it is a name. If you have to explain it first, it is a slogan, and slogans do not survive a driveway.`],
  ],
},
  ],
},
];

/* ------------------------------------------------------------------ render */

const esc = s => s.replace(/&(?!#?\w+;)/g, '&amp;');

let uid = 0;

const card = (c) => {
  const kind = c[0];

  // Pick-first debate: you commit to a side before the answer is revealed.
  // That ordering is the whole point — reading someone else's conclusion
  // teaches nothing, choosing wrong and finding out teaches a lot.
  if (kind === 'debate') {
    const [, title, pro, con, land] = c;
    const id = 'd' + (++uid);
    return `<article class="card debate" data-debate="${id}">
  <div class="slush"></div>
  <div class="body">
    <h3>${esc(title)}</h3>
    <div class="side"><span class="tag">One side</span><p>${esc(pro)}</p></div>
    <div class="side"><span class="tag">Other side</span><p>${esc(con)}</p></div>
    <div class="choose">
      <p class="ask">Which do you think is right?</p>
      <button class="pick-side" data-side="one">The first one</button>
      <button class="pick-side" data-side="two">The second one</button>
      <button class="pick-side" data-side="both">Bit of both</button>
    </div>
    <div class="side land" hidden><span class="tag mid">Where it landed</span><p>${esc(land)}</p></div>
  </div>
</article>`;
  }

  // A thing nobody knows, what it costs to find out, and a box to tick.
  if (kind === 'unknown') {
    const [, title, cost, body] = c;
    const id = 'u' + (++uid);
    return `<article class="card unknown">
  <div class="slush"></div>
  <div class="body">
    <label class="check">
      <input type="checkbox" data-unknown="${id}">
      <span class="box" aria-hidden="true"></span>
      <span class="ct"><b>${esc(title)}</b><em>${esc(cost)}</em></span>
    </label>
    ${body ? `<p>${esc(body)}</p>` : ''}
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

  // A live colour direction: real header, real hero, real button, at real
  // size, in the actual colours. Nobody can judge a palette from a swatch
  // row — you judge it by looking at the thing it will become.
  if (kind === 'palette') {
    const [, letter, name, thesis, gives, tok] = c;
    const id = 'p' + (++uid);
    const v = Object.entries(tok).map(([k, val]) => `--${k}:${val}`).join(';');
    return `<article class="card wide palette" data-palette="${id}" data-letter="${esc(letter)}">
  <div class="slush" style="--c:${tok.brand}"></div>
  <div class="body">
    <h3><span class="letter">${esc(letter)}</span> ${esc(name)}</h3>
    <p>${esc(thesis)}</p>
    <div class="demo" style="${v}">
      <div class="demo-bar">
        <span class="demo-name">Slush<b> Sisters</b></span>
        <span class="demo-btn">Book</span>
      </div>
      <div class="demo-hero">
        <p class="demo-kicker">Finley, 11 &amp; Harper, 8</p>
        <p class="demo-h1">Frozen drinks for your party.</p>
        <p class="demo-body">Two flavors, a candy on every cup, and we come back the next morning.</p>
        <span class="demo-cta">Check your date</span>
      </div>
      <div class="demo-price"><b>$250</b><span>per party</span></div>
    </div>
    <p class="gives"><b>What it gives up:</b> ${esc(gives)}</p>
    <button class="pick-side vote" data-vote="${esc(letter)}">Pick ${esc(letter)}</button>
  </div>
</article>`;
  }

  // Sortable table. Built for one job: sort the sweeteners by sweetness,
  // then by freezing power, and watch the two orders refuse to match. That
  // mismatch IS the science — no paragraph explains it as well as doing it.
  if (kind === 'sortable') {
    const [, title, note, cols, rows] = c;
    return `<article class="card wide sortable">
  <div class="slush"></div>
  <div class="body">
    <h3>${esc(title)}</h3>
    <p>${esc(note)}</p>
    <div class="tw"><table>
      <thead><tr>${cols.map((h, i) =>
        `<th${i ? ' class="num"' : ''}><button class="sort" data-col="${i}">${esc(h)}<span aria-hidden="true">↕</span></button></th>`
      ).join('')}</tr></thead>
      <tbody>${rows.map(r =>
        `<tr>${r.map((v, i) => `<td${i ? ' class="num"' : ''} data-v="${esc(String(v))}">${esc(String(v))}</td>`).join('')}</tr>`
      ).join('')}</tbody>
    </table></div>
  </div>
</article>`;
  }

  // The freeze test, before you run it. Drag the sugar down and watch the
  // texture change. The stop line is marked because the real machine has one.
  if (kind === 'brix') {
    const [, title, note] = c;
    return `<article class="card wide brix">
  <div class="slush"></div>
  <div class="body">
    <h3>${esc(title)}</h3>
    <p>${esc(note)}</p>
    <div class="brix-out">
      <output id="brixVal">15</output><span class="unit">°Brix</span>
      <p class="verdict" id="brixV">Smooth slush. This is the target.</p>
    </div>
    <input type="range" id="brixR" min="6" max="22" step="1" value="15"
           aria-label="Sugar level in degrees Brix">
    <div class="scale"><span>6 — a block of ice</span><span>22 — never freezes</span></div>
    <p class="warn">Below about 11 the machine starts fighting it. If the motor pitch
      changes on the real one, switch to chill mode straight away.</p>
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
@font-face{font-family:'Baloo 2';font-weight:800;font-display:swap;src:url(data:font/ttf;base64,${SOUR}) format('truetype');}
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
h1,h2,h3{font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;margin:0;text-wrap:balance;line-height:1.08;}
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
.big{font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;
  font-size:clamp(2.2rem,6vw,3rem);color:var(--ice);line-height:1;
  font-variant-numeric:tabular-nums;}

.debate .side{border-top:1.5px solid var(--line);padding-top:10px;display:flex;flex-direction:column;gap:5px;}
/* display:flex above beats the hidden attribute's UA display:none, which
   would leak the answer before the reader has committed to a side. */
.debate .side[hidden]{display:none;}
.debate .side.land{border-top-width:3px;border-top-color:var(--ice);}
.tag{font-weight:700;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;
  align-self:flex-start;padding:3px 9px;border-radius:999px;border:1.5px solid var(--line);color:var(--soft);}
.tag.mid{background:var(--ice);border-color:var(--ice);color:var(--on-brand);}

/* ---- pick-a-side ---- */
.choose{border-top:1.5px solid var(--line);padding-top:12px;display:flex;flex-wrap:wrap;gap:8px;}
.choose .ask{flex:1 0 100%;font-weight:700;color:var(--ink);font-size:.88rem;}
.pick-side{font-family:inherit;font-weight:700;font-size:.82rem;cursor:pointer;
  border:1.5px solid var(--line);background:var(--panel);color:var(--ink);
  border-radius:999px;padding:10px 15px;min-height:44px;transition:.14s;}
.pick-side:hover{border-color:var(--ice);}
.pick-side:focus-visible{outline:3px solid var(--ice);outline-offset:2px;}
.pick-side[aria-pressed="true"]{background:var(--ice);border-color:var(--ice);color:var(--on-brand);}
.card.answered .choose .ask{color:var(--soft);font-weight:500;}

/* ---- unknowns checklist ---- */
.check{display:flex;gap:11px;align-items:flex-start;cursor:pointer;}
.check input{position:absolute;opacity:0;width:0;height:0;}
.check .box{width:24px;height:24px;flex-shrink:0;margin-top:1px;border:2px solid var(--line);
  border-radius:7px;display:grid;place-items:center;transition:.14s;}
.check .box::after{content:"";width:10px;height:5.5px;border-left:2.5px solid var(--on-brand);
  border-bottom:2.5px solid var(--on-brand);transform:rotate(-45deg) scale(0);transition:.14s;}
.check input:checked + .box{background:var(--ice);border-color:var(--ice);}
.check input:checked + .box::after{transform:rotate(-45deg) scale(1);}
.check input:focus-visible + .box{outline:3px solid var(--ice);outline-offset:2px;}
.check .ct{display:flex;flex-direction:column;gap:3px;}
.check .ct b{font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;font-size:1.02rem;line-height:1.25;}
.check .ct em{font-style:normal;font-weight:700;font-size:.78rem;color:var(--ice);}
.card.unknown input:checked ~ .ct b{text-decoration:line-through;color:var(--soft);}


/* ---- palette chooser ---- */
.palette .letter{display:inline-grid;place-items:center;width:1.7em;height:1.7em;border-radius:50%;
  background:var(--ice);color:var(--on-brand);font-size:.85em;vertical-align:middle;margin-right:6px;}
.demo{border:1.5px solid var(--line);border-radius:14px;overflow:hidden;margin-top:6px;}
.demo-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:11px 14px;background:var(--panel);border-bottom:1px solid var(--line);}
.demo-name{font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;font-size:1.02rem;color:var(--brand);}
.demo-name b{color:var(--ink);font-weight:800;}
.demo-btn{background:var(--brand);color:var(--on-brand);font-weight:700;font-size:.78rem;
  padding:8px 15px;border-radius:8px;}
.demo-hero{background:var(--ground);padding:18px 16px;display:flex;flex-direction:column;gap:7px;align-items:flex-start;}
.demo-kicker{font-weight:700;font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brand);}
.demo-h1{font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;font-size:1.35rem;
  line-height:1.12;color:var(--ink);}
.demo-body{font-size:.83rem;color:var(--soft);line-height:1.5;}
.demo-cta{background:var(--brand);color:var(--on-brand);font-weight:700;font-size:.82rem;
  padding:11px 20px;border-radius:8px;margin-top:3px;}
.demo-price{background:var(--panel);padding:12px 16px;display:flex;align-items:baseline;gap:8px;
  border-top:1px solid var(--line);}
.demo-price b{font-family:'Baloo 2',system-ui,sans-serif;font-size:1.7rem;color:var(--brand);
  font-variant-numeric:tabular-nums;}
.demo-price span{font-size:.78rem;color:var(--soft);}
.gives{font-size:.86rem;}
.gives b{color:var(--ink);}
.vote{align-self:flex-start;margin-top:4px;}
.card.chosen{box-shadow:0 0 0 3px var(--ice),var(--shadow);}
.tally{position:sticky;bottom:12px;z-index:5;margin:22px 0 0;padding:13px 17px;border-radius:999px;
  background:var(--panel);border:1.5px solid var(--line);box-shadow:var(--shadow);
  font-weight:700;font-size:.9rem;text-align:center;}

/* ---- sortable table ---- */
.card.wide{grid-column:1/-1;}
.tw{overflow-x:auto;margin-top:4px;}
.sortable table{border-collapse:collapse;width:100%;font-size:.9rem;}
.sortable th,.sortable td{text-align:left;padding:9px 12px;border-bottom:1.5px solid var(--line);white-space:nowrap;}
.sortable td.num,.sortable th.num{text-align:right;font-variant-numeric:tabular-nums;}
.sortable td{color:var(--soft);}
.sortable td:first-child{color:var(--ink);font-weight:700;}
.sort{font-family:inherit;font-weight:700;font-size:.76rem;letter-spacing:.06em;text-transform:uppercase;
  background:none;border:0;color:var(--ink);cursor:pointer;padding:4px 0;display:inline-flex;gap:6px;min-height:44px;align-items:center;}
.sort span{color:var(--soft);}
.sort[aria-sort] span{color:var(--ice);}
.sort:focus-visible{outline:3px solid var(--ice);outline-offset:2px;}

/* ---- brix slider ---- */
.brix-out{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:6px;}
.brix-out output{font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;
  font-size:clamp(2.4rem,7vw,3.2rem);color:var(--ice);line-height:1;font-variant-numeric:tabular-nums;}
.brix-out .unit{font-weight:700;color:var(--soft);}
.brix-out .verdict{flex:1 0 100%;font-weight:700;color:var(--ink);font-size:.98rem;margin-top:6px;}
.brix input[type=range]{width:100%;margin:14px 0 6px;height:44px;accent-color:var(--ice);}
.brix .scale{display:flex;justify-content:space-between;font-size:.76rem;color:var(--soft);font-weight:700;}
.brix .warn{margin-top:12px;padding-top:12px;border-top:1.5px solid var(--line);font-size:.86rem;color:var(--soft);}
.brix.danger .brix-out output{color:#e5734f;}

.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:16px;margin-top:8px;}
.tile{display:flex;flex-direction:column;background:var(--panel);border:1.5px solid var(--line);
  border-radius:16px;overflow:hidden;box-shadow:var(--shadow);text-decoration:none;transition:.16s;}
.tile:hover{transform:translateY(-2px);border-color:var(--ice);}
.tile .body{gap:7px;}
.tile h3{font-size:1.18rem;color:var(--brand);}
.tile .go{margin-top:auto;padding-top:10px;font-weight:700;font-size:.82rem;color:var(--ice);}

footer{border-top:1.5px solid var(--line);padding-top:22px;display:flex;flex-direction:column;gap:16px;}
footer .fi b{display:block;color:var(--ink);font-family:'Baloo 2',sans-serif;font-weight:800;
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
<script>
(function(){
  var save=function(k,v){try{localStorage.setItem(k,v);}catch(e){}};
  var load=function(k){try{return localStorage.getItem(k);}catch(e){return null;}};

  // Pick a side, then the answer appears. Choices persist so a half-read
  // page survives a closed tab.
  document.querySelectorAll('[data-debate]').forEach(function(card){
    var key='ss-debate-'+card.dataset.debate;
    var land=card.querySelector('.land');
    var btns=card.querySelectorAll('.pick-side');
    function reveal(side){
      btns.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.side===side));});
      land.hidden=false; card.classList.add('answered');
    }
    btns.forEach(function(b){
      b.addEventListener('click',function(){ save(key,b.dataset.side); reveal(b.dataset.side); });
    });
    var prev=load(key); if(prev) reveal(prev);
  });

  // Unknowns checklist.
  document.querySelectorAll('[data-unknown]').forEach(function(box){
    var key='ss-unknown-'+box.dataset.unknown;
    if(load(key)==='1') box.checked=true;
    box.addEventListener('change',function(){ save(key, box.checked?'1':'0'); });
  });


  // Palette vote. One choice, remembered, shown at the bottom.
  var voteBox=document.getElementById('voteOut');
  if(voteBox){
    var vk='ss-palette-choice';
    function showVote(v){
      document.querySelectorAll('[data-palette]').forEach(function(card){
        var on=card.dataset.letter===v;
        card.classList.toggle('chosen',on);
        var b=card.querySelector('.vote');
        b.setAttribute('aria-pressed',String(on));
        b.textContent=on?('Picked '+card.dataset.letter):('Pick '+card.dataset.letter);
      });
      voteBox.textContent=v?('You picked '+v+'. Tell Dad.'):'Pick one. You can change your mind.';
    }
    document.querySelectorAll('.vote').forEach(function(b){
      b.addEventListener('click',function(){ save(vk,b.dataset.vote); showVote(b.dataset.vote); });
    });
    showVote(load(vk)||'');
  }

  // Sortable tables. Numeric where the cell parses as a number, else text.
  document.querySelectorAll('.sortable table').forEach(function(t){
    var body=t.tBodies[0];
    t.querySelectorAll('.sort').forEach(function(btn){
      btn.addEventListener('click',function(){
        var col=+btn.dataset.col;
        var asc=btn.getAttribute('aria-sort')!=='ascending';
        t.querySelectorAll('.sort').forEach(function(o){o.removeAttribute('aria-sort');});
        btn.setAttribute('aria-sort', asc?'ascending':'descending');
        var rows=[].slice.call(body.rows);
        rows.sort(function(a,b){
          var x=a.cells[col].dataset.v, y=b.cells[col].dataset.v;
          var nx=parseFloat(x), ny=parseFloat(y);
          var d=(!isNaN(nx)&&!isNaN(ny)) ? nx-ny : x.localeCompare(y);
          return asc?d:-d;
        });
        rows.forEach(function(r){body.appendChild(r);});
      });
    });
  });

  // Brix slider. Bands follow the machine manual's working range, with the
  // low end marked as the place the auger starts to struggle.
  var r=document.getElementById('brixR');
  if(r){
    var out=document.getElementById('brixVal'), v=document.getElementById('brixV'),
        cardEl=r.closest('.brix');
    var say=function(n){
      if(n<=9)  return ['A solid block. The machine cannot turn this.',1];
      if(n<=11) return ['Too hard. The motor is working far too hard — stop.',1];
      if(n<=12) return ['Gritty and chunky. Pours badly.',0];
      if(n<=16) return ['Smooth slush. This is the target.',0];
      if(n<=18) return ['Soft and a bit sloppy. Sweet, but barely frozen.',0];
      return ['Never really freezes. Too much sugar.',0];
    };
    var upd=function(){
      var n=+r.value, s=say(n);
      out.textContent=n; v.textContent=s[0];
      cardEl.classList.toggle('danger', !!s[1]);
    };
    r.addEventListener('input',upd); upd();
  }
})();
</script>
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
  <!-- trailing slash on purpose: /read 307-redirects to /read/ on the Worker,
       and this link gets used on every page, on a phone -->
  <a class="back" href="/read/">&larr; All of them</a>
  <div class="hero">
    <p class="eyebrow">${esc(page.kicker)}</p>
    <h1>${esc(page.title)}</h1>
    <p class="lede">${esc(page.lede)}</p>
  </div>
</div>

<div class="wrap">
${groups}

  ${page.slug === 'pick-the-colours' ? '<p class="tally" id="voteOut">Pick one. You can change your mind.</p>' : ''}

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
