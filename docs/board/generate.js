const fs = require('fs');
const b64 = f => fs.readFileSync(f).toString('base64');
const SOUR = b64('/root/.fonts/brand-1.ttf');

// cat: colour key. cost: free | cheap | money. effort: easy | medium | big
const IDEAS = [
  // POST THIS WEEK
  ['week','Count the money','Count the cash box after a party. Say the real number out loud.','free','easy'],
  ['week','What you still owe Dad','Update the machine loan balance. Do it every month, forever.','free','easy'],
  ['week','Rank all six flavours','Worst to best. Disagree with each other. Do not agree for the camera.','free','easy'],
  ['week','Invent a terrible flavour','Make one on purpose that is awful. Post it anyway. These always do well.','free','easy'],
  ['week','Set up, sped up','A whole party setup squeezed into ten seconds.','free','easy'],
  ['week','Squeeze a hundred limes','Satisfying, ridiculous, obviously real work.','cheap','easy'],
  ['week','Read the other guys ingredients','Read the label on the bulk mix everyone else uses. Out loud. Slowly.','free','easy'],
  ['week','Clean the machine','People genuinely love watching this. No idea why. They do.','free','easy'],

  // SHOW THE MONEY
  ['money','Profit on one party','In, out, what is left. Work it out on camera.','free','easy'],
  ['money','Is a booking worth the drive?','Do the Dripping Springs mileage maths out loud and decide.','free','easy'],
  ['money','Show the LLC paperwork','Explain what an LLC even is, in your own words.','free','easy'],
  ['money','Should we buy a second machine?','Argue both sides properly. Let people vote. Do what they say.','free','medium'],
  ['money','Why it costs $250','Explain the price and what is included. No apologising for it.','free','easy'],
  ['money','The Open Ledger','A page on the site: cups poured, money in, money out, loan left. Updated forever.','free','medium'],
  ['money','Cup Number','Number every cup ever poured. Tell hosts their range. Celebrate the 10,000th.','free','medium'],

  // JUST YOU TWO
  ['you','Argue about something silly','Sixty seconds. Neither of you backs down.','free','easy'],
  ['you','Who builds it faster','Sister vs sister. Time it. Loser does the other one’s job next party.','free','easy'],
  ['you','Time Dad doing a setup alone','Film it. Do not help him.','free','easy'],
  ['you','Dad’s Performance Review','Review your driver on camera. Punctuality, van cleanliness, talking too much.','free','easy'],
  ['you','Bored in the van','Long drive, nothing happening. That is the video.','free','easy'],
  ['you','Answer the comments','On camera. People love being answered by name.','free','easy'],
  ['you','Texas summer, honestly','Your real opinion of August. No filter.','free','easy'],

  // MAKE SOMETHING NEW
  ['make','Fresh Press','Real limes, real fruit, agave. A proper margarita mix, not syrup. Costs more, worth more.','money','big'],
  ['make','No dye at all','Kid flavours coloured by fruit only. Loads of parents want exactly this.','cheap','medium'],
  ['make','The freeze test','Find out how low the sugar can go before the machine fights back. Real science.','cheap','medium'],
  ['make','Syrup vs fresh, blind','Let people who do not know which is which pick a favourite. Post it honestly.','cheap','easy'],
  ['make','Name a flavour with a local shop','Team up with a bakery or coffee place. Their name on it. Limited run.','cheap','medium'],
  ['make','The Garnish Kit','A little box of the six candies, matched to the flavours, in your handwriting. Ships anywhere.','money','big'],

  // MORE TO POST
  ['week','Pour the first cup of the day','The very first one out of the tank. Slow motion.','free','easy'],
  ['week','Layer two flavours','One cup, both tanks. See what happens.','free','easy'],
  ['week','All six garnishes lined up','Every candy next to the flavour it belongs with.','free','easy'],
  ['week','Blind taste test','Can you actually tell which flavour is which? Prove it.','free','easy'],
  ['week','Time-lapse the freeze','Watch liquid turn into slush. Oddly hypnotic.','free','easy'],
  ['week','What is in the setup kit','Empty the bag out. Explain every single thing.','free','easy'],
  ['week','Load the van','Everything that goes in, in order.','free','easy'],
  ['week','Pick up the next morning','The unglamorous half nobody sees.','free','easy'],
  ['week','A setup that went wrong','Rain, a spill, a forgotten lid. Post the bad one.','free','easy'],
  ['week','Every flavour with Tajin','Rate them. Be honest about the bad ones.','cheap','easy'],

  // MORE MONEY
  ['money','Open the business mail','Whatever came. Read it out.','free','easy'],
  ['money','What you are saving for','The actual goal, and how close you are.','free','easy'],
  ['money','What you would do differently','If you started the whole thing again tomorrow.','free','easy'],
  ['money','The hardest part','Say the genuinely hard thing, not the polite version.','free','easy'],
  ['money','Who does what','Finley jobs and Harper jobs. Where you overlap and argue.','free','easy'],

  // MORE JUST YOU TWO
  ['you','Swap jobs for a day',"Do each other's job. Find out which is harder.",'free','easy'],
  ['you','Make each other laugh, no talking','Sixty seconds. First to break loses.','free','easy'],
  ['you','Rate each others outfits','Out of ten. No mercy.','free','easy'],
  ['you','Your favourite spot in Lakeway','Somewhere you actually go.','free','easy'],
  ['you','Something you were scared of','And did anyway. What happened.','free','easy'],
  ['you','Advice for a kid starting a business','What you wish someone had told you.','free','easy'],

  // GROW THE BUSINESS - the structural stuff
  ['grow','The birthday loop','Every customer has a birthday every year. Write to them in month eleven: same week next year? This is the biggest one on the whole board.','free','easy'],
  ['grow','Cold drinks, not just frozen','The machine chills as well as freezes. Rocks margaritas, sangria, punch - grown-up drinks that would be odd as a slushie. A whole extra season and no new machine.','free','medium'],
  ['grow','Cheaper than a bartender','A bartender for a holiday party costs more than we do and pours one drink at a time. Two tanks pour themselves all night. Say that out loud in the pitch.','free','easy'],
  ['grow','Office holiday parties','Nov and Dec are dead for birthdays and the busiest weeks of the year for office parties. Same machine, different customer, and they book earlier.','free','medium'],
  ['grow','Work out the cold recipes','Frozen mode limits how strong a drink can be, because alcohol stops it freezing. Cold mode does not. Find out which drinks that unlocks. Fizzy ones will not work in the tank.','cheap','medium'],
  ['grow','Guard the recipe, not the sweets','Anyone can copy a sweet on a rim, so there is nothing to sell there. What nobody can copy quickly is knowing how low the sugar can go before the machine stalls. Work that out and write it down.','free','medium'],
  ['grow','Be the overflow','When another company is double booked on a Saturday they lose that party. Offer to take their overflow. Free bookings.','free','medium'],
  ['grow','Weekday offices','Austin offices do summer parties on Tuesdays. Bigger budgets, and the machine is sitting idle anyway.','free','medium'],
  ['grow','PTA season tickets','Every school has a PTA with a budget and several events a year. Sell the year, not the party.','free','medium'],
  ['grow','Keep a customer list','Names, dates, which flavours they picked, whether they had a good time. Boring. Worth more than any video.','free','easy'],
  ['grow','Ask how they found you','Every single booking. Write it down. After twenty you will know exactly what works.','free','easy'],
  ['grow','A second machine, on purpose','Two machines means two parties on one Saturday. Work out whether the maths actually works before buying.','money','big'],
  ['grow','Raise the price on peak dates','Saturdays in June are worth more than Tuesdays in March. Most businesses charge the same anyway.','free','medium'],

  // BIG SWINGS
  ['big','Apprentice of the Day','The birthday kid gets a shirt, a title and the first fifteen minutes of the job. They keep the shirt.','cheap','easy'],
  ['big','The Annual Report','A real printed report from a 10-year-old CEO. Post forty copies to people who matter.','cheap','big'],
  ['big','Kids Review Ads','Rate real billboards and adverts out of ten. Nothing to do with slushies. That is the point.','free','easy'],
  ['big','The Realtor Circuit','Frozen drinks at open houses on weekday afternoons. Dead time turned into money.','free','medium'],
  ['big','Hottest day of the year','When it hits 105°, give cups away somewhere public. Tell the news that morning.','cheap','medium'],
  ['big','Now Hiring: Driver','Post a real job advert for Dad’s job. Reports to Finley, age 10. Interview people on camera.','free','easy'],
  ['big','The Rejection Wall','A public list of every no. Dated, unedited. Never name a customer.','free','easy'],
  ['big','Interview the old guy','Find the man who has rented margarita machines for twenty years. Ask him everything.','free','medium'],
  ['big','The Party Report Card','You grade the party. Crowd energy, best costume, did anyone say thank you.','free','easy'],
  ['big','Kid Business Radio','Interview other kids who run businesses. Ask about money, not hobbies.','free','big'],
  ['big','Write to the candy company','You have used their sweets on every cup since day one, free. Tell them, with the numbers.','free','easy'],
  ['big','Chapters','Kids in other cities running their own Slush Sisters off a playbook you write.','free','big'],
  // REAL PLACES TO ENTER - every one of these was checked
  ['reach','Children\u2019s Business Fair, West Lake Hills',"A real market where kids run booths. Acton Academy West, 3423 Bee Caves Rd - about four miles away. Saturday 1 May 2027, applications open NOW. You do the selling, not a grown-up.",'free','medium'],
  ['reach','Host your own Business Fair',"They hand you the playbook, the website and the prize money for free. You find the place. Being the organiser beats being a stall holder. Possibly the best single thing on this board.",'free','big'],
  ['reach','Kids Market at Volente Beach',"22 August, at a waterpark, in August. Ages 5 to 17. Check the food rules first - some markets only allow packaged food.",'cheap','medium'],
  ['reach','Lake Travis Current: Meet Your Neighbour',"A local newsletter, 4,000+ readers every week, with a feature slot built exactly for this. Smallest ask, best match.",'free','easy'],
  ['reach','Lake Travis View',"The Statesman\u2019s Lake Travis section. Real local news, and the mayors of Lakeway and Bee Cave both write columns in it.",'free','medium'],
  ['reach','Neighbours of Lakeway and Bee Cave',"A magazine posted to local homes whose whole job is featuring local families. They have a form to nominate someone.",'free','easy'],
  ['reach','Steiner Ranch Ranch Record',"The Steiner Ranch newsletter goes to 5,000 homes and is paid for by local adverts. Small ad, exactly the right people.",'money','easy'],
  ['reach','Rough Hollow Rough Life Director',"Rough Hollow employs someone whose entire job is running community events all year. Kid events and grown-up events. Best phone call on this list.",'free','easy'],
  ['reach','Headwaters lifestyle team',"Headwaters in Dripping Springs has a lifestyle director and a farmers market every Saturday.",'free','easy'],
  ['reach','West Austin Moms group',"A Facebook group that literally says Lakeway, Bee Cave, Westlake and Spicewood in its description.",'free','easy'],
  ['reach','Every LTISD school PTO',"Eleven schools, every one with a parents group and a budget. Birthday party word of mouth runs straight through these.",'free','medium'],
  ['reach','Lemonade Day Entrepreneur of the Year',"A national title you can enter from age five. Prizes $500, $300, $200. Mikaila Ulmer did Lemonade Day in Austin at six and ended up on Shark Tank.",'free','easy'],
  ['reach','NFTE Imagination League',"National competition, ages 5 to 12, free. New challenges every September.",'free','medium'],
  ['reach','TIME Kid of the Year',"Ages 8 to 17. Running a business is one of the things they specifically look for. A grown-up enters you. Free.",'free','medium'],
  ['reach','Young Entrepreneur Pitch Challenge',"A 30 to 90 second video pitch. Separate brackets for K-4 and 5-8, so you two are not competing against each other. Opens around March.",'free','easy'],
  ['reach','Message the good news accounts',"@goodnews_movement has about six million followers and asks people to send in local good news. Two sisters with a real LLC is exactly their thing. Costs one message.",'free','easy'],
  ['reach','Austin family accounts',"@austinfunforkids (85k), @austinwithkids (69k), @austinadventurekids (39k), @do512family. Big enough to matter, small enough to reply.",'free','easy'],
  ['reach','Mikaila Ulmer, Me and the Bees',"Started her lemonade company at four, went on Shark Tank, sells in Whole Foods, and lives in Austin. Fun fact: whoever built your website borrowed a design idea from hers.",'free','medium'],
  ['reach','Alina Morse, Zolli Candy',"Started at ten. Sells sweets. You put sweets on every single cup. Obvious person to talk to.",'free','medium'],
  ['reach','Backyard Bounce LT',"A bounce house company based in Lakeway that delivers to all the same places you do. Same party, same customer, no overlap. Start here.",'free','easy'],
  ['reach','Little Acorns Photography',"A kids party photographer based in Lakeway. You are both at the same parties.",'free','easy'],
  ['reach','Lakeway city events',"July 4th parade, Trail of Lights, Movies at the Park, and Christmas in July at the swim centre. Some already take food vendors. events@lakeway-tx.gov",'free','medium'],
  ['reach','Dripping Springs Founders Day',"April, 37th year, 150+ vendor booths, a parade and a carnival. There is a vendor page on the city website.",'cheap','medium'],
  ['reach','Entrepreneur Kids Legacy Show',"A podcast hosted by two kids that is genuinely still going. Small, friendly, and they answer. Good first interview.",'free','easy'],
  ['reach','Million Bazillion',"A big national money podcast for kids from public radio. They use recorded questions from kids. Send one.",'free','easy'],
  ['reach','Rental Management magazine',"The trade magazine for rental companies. They profile new ones. You would be the youngest in the entire industry.",'free','medium'],
  ['reach','Shark Tank',"Applications usually open January to April and a parent applies with you. Kids as young as six have pitched. The audition tape is worth making either way.",'free','big'],
];

const CATS = {
  week:  ['Post this week',   '#4fc3f7', 'Quick. Pick one and film it today.'],
  money: ['Show the money',   '#7ed957', 'Your best ones. Nobody else can make these.'],
  you:   ['Just you two',     '#ff4081', 'Nothing to do with slushies. Half your posts should be these.'],
  make:  ['Make something',   '#ffd54f', 'New recipes, new products. Test before you sell.'],
  grow:  ['Grow the business','#b06cf0', 'Not posts. Ways the business itself gets bigger.'],
  big:   ['Big swings',       '#ff8a3d', 'Ambitious. Some need a grown-up to make a call first.'],
  reach: ['Real places to enter','#4dd0c4','Actual competitions, awards and people. All checked and real.'],
};

const COST = { free: ['Free', '#7ed957'], cheap: ['A few $', '#ffd54f'], money: ['Costs money', '#ff8a3d'] };
const EFFORT = { easy: 'Easy', medium: 'Takes a bit', big: 'Big job' };

const card = (o, i) => {
  const [cat, title, body, cost, effort] = o;
  const [costLabel, costColour] = COST[cost];
  return `<article class="card" data-cat="${cat}" data-cost="${cost}" data-effort="${effort}">
  <div class="slush" style="--c:${CATS[cat][1]}"></div>
  <div class="body">
    <h3>${title}</h3>
    <p>${body}</p>
    <div class="chips">
      <span class="chip" style="--c:${costColour}">${costLabel}</span>
      <span class="chip ghost">${EFFORT[effort]}</span>
    </div>
  </div>
  <button class="pick" data-id="${i}" aria-pressed="false">
    <span class="tick" aria-hidden="true"></span><span class="pick-label">Pick this</span>
  </button>
</article>`;
};

const sections = Object.entries(CATS).map(([key, [name, colour, blurb]]) => {
  const cards = IDEAS.map((o, i) => [o, i]).filter(([o]) => o[0] === key);
  return `<section class="group" data-group="${key}">
  <header class="group-head" style="--c:${colour}">
    <h2>${name}</h2>
    <p>${blurb}</p>
    <span class="count">${cards.length}</span>
  </header>
  <div class="grid">
${cards.map(([o, i]) => card(o, i)).join('\n')}
  </div>
</section>`;
}).join('\n\n');

const NOINDEX = process.argv[3] === '--noindex';

const html = `${NOINDEX ? `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#1a237e">
` : ''}<title>Slush Sisters — the idea board</title>
<style>
/* swap, never block: with font-display:block the whole page stays invisible
   until the face resolves, so a slow or failed decode renders a blank screen. */
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
  font-family:'DM Sans',system-ui,sans-serif;font-weight:500;line-height:1.55;
}
h1,h2,h3{font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;margin:0;text-wrap:balance;line-height:1.05;}
p{margin:0;}

.wrap{max-width:1120px;margin:0 auto;padding:0 20px 88px;}
.wrap.top{padding-bottom:0;}

/* ---- hero ---- */
.hero{padding:64px 0 36px;display:flex;flex-direction:column;gap:18px;}
.eyebrow{font-weight:700;font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;color:var(--ice);}
.hero h1{font-size:clamp(2.4rem,7vw,4.4rem);color:var(--brand);}
.hero .lede{font-size:clamp(1rem,2.2vw,1.2rem);color:var(--soft);max-width:56ch;}
.tally{display:inline-flex;align-items:center;gap:8px;margin-top:4px;align-self:flex-start;
  background:var(--panel);border:1.5px solid var(--line);border-radius:999px;padding:7px 16px 7px 9px;}
.tally b{font-family:inherit;font-weight:700;font-size:.95rem;color:var(--on-brand);
  background:var(--ice);border-radius:999px;min-width:30px;padding:2px 9px;text-align:center;
  font-variant-numeric:tabular-nums;}
.tally span{font-family:inherit;font-weight:700;font-size:.86rem;color:var(--soft);}

/* ---- filters ---- */
.bar{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--ground) 88%,transparent);
  backdrop-filter:blur(10px);border-bottom:1.5px solid var(--line);
  padding:12px 0;margin-bottom:34px;}
.bar-in{max-width:1120px;margin:0 auto;padding:0 20px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.bar b{font-family:inherit;font-weight:700;font-size:.72rem;letter-spacing:.14em;
  text-transform:uppercase;color:var(--soft);margin-right:2px;}
.f{appearance:none;border:1.5px solid var(--line);background:var(--panel);color:var(--ink);
  font-family:inherit;font-weight:700;font-size:.82rem;
  padding:7px 14px;border-radius:999px;cursor:pointer;transition:.14s;}
.f:hover{border-color:var(--ice);}
.f[aria-pressed="true"]{background:var(--brand);border-color:var(--brand);color:var(--on-brand);}
.f:focus-visible{outline:3px solid var(--ice);outline-offset:2px;}

/* ---- groups ---- */
.group{margin-bottom:52px;}
.group-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;
  padding-bottom:12px;margin-bottom:20px;border-bottom:3px solid var(--c);}
.group-head h2{font-size:clamp(1.4rem,3.4vw,2rem);color:var(--ink);}
.group-head p{color:var(--soft);font-size:.92rem;flex:1 1 240px;}
.count{font-family:inherit;font-weight:700;font-size:.74rem;letter-spacing:.1em;
  color:#16203f;background:var(--c);padding:3px 10px;border-radius:999px;}

.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(258px,1fr));gap:16px;}

/* ---- card: the top edge is a slush line, the one shape this business owns ---- */
.card{background:var(--panel);border:1.5px solid var(--line);border-radius:16px;
  overflow:hidden;display:flex;flex-direction:column;box-shadow:var(--shadow);transition:.16s;}
.card:hover{transform:translateY(-2px);border-color:var(--ice);}
.card[data-picked="1"]{border-color:var(--ice);box-shadow:0 0 0 2px var(--ice), var(--shadow);}
.slush{height:16px;background:var(--c);
  -webkit-mask:radial-gradient(9px at 9px 100%,#0000 98%,#000) repeat-x 0 100%/18px 12px;
  mask:radial-gradient(9px at 9px 100%,#0000 98%,#000) repeat-x 0 100%/18px 12px;}
.body{padding:14px 16px 12px;display:flex;flex-direction:column;gap:7px;flex:1;}
.card h3{font-family:inherit;font-weight:700;font-size:1.02rem;letter-spacing:-.01em;line-height:1.25;}
.card p{font-size:.86rem;color:var(--soft);line-height:1.5;}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:6px;}
.chip{font-weight:700;font-size:.68rem;letter-spacing:.05em;text-transform:uppercase;
  padding:3px 9px;border-radius:999px;background:var(--c);color:#16203f;}
.chip.ghost{background:transparent;border:1.5px solid var(--line);color:var(--soft);}

.pick{display:flex;align-items:center;gap:8px;width:100%;
  border:0;border-top:1.5px solid var(--line);background:transparent;color:var(--soft);
  font-family:inherit;font-weight:700;font-size:.8rem;
  padding:11px 16px;cursor:pointer;transition:.14s;}
.pick:hover{background:color-mix(in srgb,var(--ice) 12%,transparent);color:var(--ink);}
.pick:focus-visible{outline:3px solid var(--ice);outline-offset:-3px;}
.tick{width:17px;height:17px;border:2px solid var(--line);border-radius:5px;flex-shrink:0;
  display:grid;place-items:center;transition:.14s;}
.tick::after{content:"";width:8px;height:4.5px;border-left:2.5px solid #16203f;border-bottom:2.5px solid #16203f;
  transform:rotate(-45deg) scale(0);transition:.14s;}
.card[data-picked="1"] .pick{color:var(--ink);}
.card[data-picked="1"] .tick{background:var(--ice);border-color:var(--ice);}
.card[data-picked="1"] .tick::after{transform:rotate(-45deg) scale(1);}

.empty{color:var(--soft);font-size:.95rem;padding:8px 0;display:none;}
.group[hidden]{display:none;}

footer{border-top:1.5px solid var(--line);padding-top:22px;color:var(--soft);font-size:.86rem;
  display:flex;flex-direction:column;gap:8px;}
footer b{color:var(--ink);font-family:'Baloo 2',sans-serif;font-weight:800;}

@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important;}}
@media (max-width:520px){ .hero{padding:40px 0 28px;} .grid{grid-template-columns:1fr;} }
</style>${NOINDEX ? `
</head>
<body>` : ''}

<div class="wrap top">
  <div class="hero">
    <p class="eyebrow">Finley &amp; Harper &middot; Slush Sisters LLC</p>
    <h1>Pick one.<br>Go and do it.</h1>
    <p class="lede">Every idea anyone has had for this business, in one place. You do not have to do them in order and you do not have to do all of them. Two good ones a week beats seven boring ones.</p>
    <p class="tally"><b id="n">0</b> <span>picked so far</span></p>
  </div>
</div>

<div class="bar">
  <div class="bar-in">
    <b>Show me</b>
    <button class="f" data-f="all" aria-pressed="true">Everything</button>
    <button class="f" data-f="free" aria-pressed="false">Free</button>
    <button class="f" data-f="easy" aria-pressed="false">Easy</button>
    <button class="f" data-f="picked" aria-pressed="false">My picks</button>
  </div>
</div>

<div class="wrap">
${sections}
  <p class="empty" id="empty">Nothing matches that yet. Try <b>Everything</b>.</p>

  <footer>
    <p><b>One thing worth remembering.</b></p>
    <p>People do not share videos about slushies. They share videos about two kids running a real business. A nice drink gets a like. Counting the money and working out what you still owe Dad gets sent to someone.</p>
    <p>When you are stuck: show the business, not the drink.</p>
  </footer>
</div>

<script>
(function(){
  var KEY='slush-picks-v1', picked={};
  try{ picked=JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(e){ picked={}; }

  var cards=[].slice.call(document.querySelectorAll('.card'));
  var nEl=document.getElementById('n');

  function save(){ try{ localStorage.setItem(KEY,JSON.stringify(picked)); }catch(e){} }
  function count(){ nEl.textContent=Object.keys(picked).length; }

  cards.forEach(function(c){
    var btn=c.querySelector('.pick'), id=btn.dataset.id;
    if(picked[id]){ c.dataset.picked='1'; btn.setAttribute('aria-pressed','true'); btn.querySelector('.pick-label').textContent='Picked'; }
    btn.addEventListener('click',function(){
      if(picked[id]){ delete picked[id]; c.removeAttribute('data-picked');
        btn.setAttribute('aria-pressed','false'); btn.querySelector('.pick-label').textContent='Pick this'; }
      else { picked[id]=1; c.dataset.picked='1';
        btn.setAttribute('aria-pressed','true'); btn.querySelector('.pick-label').textContent='Picked'; }
      save(); count(); apply();
    });
  });
  count();

  var mode='all', empty=document.getElementById('empty');
  function apply(){
    var shown=0;
    cards.forEach(function(c){
      var ok = mode==='all'
        || (mode==='free'   && c.dataset.cost==='free')
        || (mode==='easy'   && c.dataset.effort==='easy')
        || (mode==='picked' && c.dataset.picked==='1');
      c.style.display = ok ? '' : 'none';
      if(ok) shown++;
    });
    document.querySelectorAll('.group').forEach(function(g){
      var any=[].slice.call(g.querySelectorAll('.card')).some(function(c){return c.style.display!=='none';});
      g.hidden=!any;
    });
    empty.style.display = shown ? 'none' : 'block';
  }

  document.querySelectorAll('.f').forEach(function(b){
    b.addEventListener('click',function(){
      mode=b.dataset.f;
      document.querySelectorAll('.f').forEach(function(x){ x.setAttribute('aria-pressed', String(x===b)); });
      apply();
    });
  });
})();
</script>${NOINDEX ? `
</body>
</html>` : ''}`;

fs.writeFileSync(process.argv[2], html);
console.log('wrote', process.argv[2], (html.length/1024).toFixed(0)+'KB', '|', IDEAS.length, 'ideas');
