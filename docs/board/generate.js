const fs = require('fs');
const b64 = f => fs.readFileSync(f).toString('base64');
const SOUR = b64('/root/.fonts/brand-1.ttf');
const DM_MED = b64('/root/.fonts/brand-2.ttf');
const DM_BOLD = b64('/root/.fonts/brand-3.ttf');

// cat: colour key. cost: free | cheap | money. effort: easy | medium | big
const IDEAS = [
  // POST THIS WEEK
  ['week','Count the money','Count the cash box after a party. Say the real number out loud.','free','easy'],
  ['week','What you still owe Dad','Update the machine loan balance. Do it every month, forever.','free','easy'],
  ['week','Rank all six flavours','Worst to best. Disagree with each other. Do not agree for the camera.','free','easy'],
  ['week','Invent a terrible flavour','Make one on purpose that is awful. Post it anyway. These always do well.','free','easy'],
  ['week','Set up, sped up','A whole party setup squeezed into ten seconds.','free','easy'],
  ['week','Squeeze a hundred limes','Satisfying, ridiculous, obviously real work.','cheap','easy'],
  ['week','Read the other guys’ ingredients','Read the label on the bulk mix everyone else uses. Out loud. Slowly.','free','easy'],
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
];

const CATS = {
  week:  ['Post this week',   '#4fc3f7', 'Quick. Pick one and film it today.'],
  money: ['Show the money',   '#7ed957', 'Your best ones. Nobody else can make these.'],
  you:   ['Just you two',     '#ff4081', 'Nothing to do with slushies. Half your posts should be these.'],
  make:  ['Make something',   '#ffd54f', 'New recipes, new products. Test before you sell.'],
  big:   ['Big swings',       '#ff8a3d', 'Ambitious. Some need a grown-up to make a call first.'],
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

const html = `<title>Slush Sisters — the idea board</title>
<style>
@font-face{font-family:'Sour Gummy';font-weight:800;font-display:block;src:url(data:font/ttf;base64,${SOUR}) format('truetype');}
@font-face{font-family:'DM Sans';font-weight:500;font-display:block;src:url(data:font/ttf;base64,${DM_MED}) format('truetype');}
@font-face{font-family:'DM Sans';font-weight:700;font-display:block;src:url(data:font/ttf;base64,${DM_BOLD}) format('truetype');}

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
h1,h2,h3{font-family:'Sour Gummy','DM Sans',sans-serif;font-weight:800;margin:0;text-wrap:balance;line-height:1.05;}
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
.tally b{font-family:'DM Sans',sans-serif;font-weight:700;font-size:.95rem;color:var(--on-brand);
  background:var(--ice);border-radius:999px;min-width:30px;padding:2px 9px;text-align:center;
  font-variant-numeric:tabular-nums;}
.tally span{font-family:'DM Sans',sans-serif;font-weight:700;font-size:.86rem;color:var(--soft);}

/* ---- filters ---- */
.bar{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--ground) 88%,transparent);
  backdrop-filter:blur(10px);border-bottom:1.5px solid var(--line);
  padding:12px 0;margin-bottom:34px;}
.bar-in{max-width:1120px;margin:0 auto;padding:0 20px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
.bar b{font-family:'DM Sans',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.14em;
  text-transform:uppercase;color:var(--soft);margin-right:2px;}
.f{appearance:none;border:1.5px solid var(--line);background:var(--panel);color:var(--ink);
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:.82rem;
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
.count{font-family:'DM Sans',sans-serif;font-weight:700;font-size:.74rem;letter-spacing:.1em;
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
.card h3{font-family:'DM Sans',sans-serif;font-weight:700;font-size:1.02rem;letter-spacing:-.01em;line-height:1.25;}
.card p{font-size:.86rem;color:var(--soft);line-height:1.5;}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:6px;}
.chip{font-weight:700;font-size:.68rem;letter-spacing:.05em;text-transform:uppercase;
  padding:3px 9px;border-radius:999px;background:var(--c);color:#16203f;}
.chip.ghost{background:transparent;border:1.5px solid var(--line);color:var(--soft);}

.pick{display:flex;align-items:center;gap:8px;width:100%;
  border:0;border-top:1.5px solid var(--line);background:transparent;color:var(--soft);
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:.8rem;
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
footer b{color:var(--ink);font-family:'Sour Gummy',sans-serif;font-weight:800;}

@media (prefers-reduced-motion: reduce){*{transition:none!important;animation:none!important;}}
@media (max-width:520px){ .hero{padding:40px 0 28px;} .grid{grid-template-columns:1fr;} }
</style>

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
</script>`;

fs.writeFileSync(process.argv[2], html);
console.log('wrote', process.argv[2], (html.length/1024).toFixed(0)+'KB', '|', IDEAS.length, 'ideas');
