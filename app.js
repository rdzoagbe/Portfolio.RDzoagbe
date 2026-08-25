const T={
      fr:{}, /* French is the source (in the HTML) — filled at runtime */
      en:{
        'nav.home':'Home','nav.about':'About','nav.exp':'Experience','nav.impact':'Impact','nav.expertise':'Expertise','nav.leadership':'Leadership','nav.contact':'Contact','nav.cv':'Download CV ↓',
        'hero.badge':'Available immediately','hero.h1a':'IT Infrastructure & ','hero.h1b':'Service Delivery','hero.h1c':' Leader','hero.sub':'I help companies build reliable infrastructure, improve service quality and grow high-performing teams to support growth.','pill.infra':'Infrastructure','hero.cta1':'Explore my experience →','hero.cta2':'Contact me','hero.loc':'Île-de-France, France','hero.avail':'Available immediately','hero.intl':'Open internationally','hero.cardav':'Available','hero.cardrole':'IT Infrastructure & Service Delivery Leader','hero.cardtxt':'Based in Île-de-France · open in France & internationally',
        'st.1b':'Years in IT','st.1d':'Infrastructure, support & operations.','st.2b':'Users supported','st.2d':'24/7 multi-site operations (HBS).','st.3b':'MTTR reduction','st.3d':'Support performance & SLA.','st.4b':'Best practices & ITSM','st.4d':'IT service management.','st.5b':'Azure · M365 · Entra ID','st.5d':'Modern workplace & security.','st.6b':'Multi-site environments','st.6d':'English & French.',
        'about.kicker':'About','about.title':'Leadership with real hands-on depth.','about.p1t':'Professional profile','about.p1':"Passionate about IT for as long as I can remember, I built my career around infrastructure, service and teams. I moved from frontline support into infrastructure, operations and IT management. I combine technical execution, service quality, leadership and continuous improvement to deliver reliable, secure solutions aligned with business needs.",'about.p2t':'What I bring','about.b1':'✓ Leadership of support and infrastructure teams.','about.b2':'✓ Microsoft 365, Azure, Intune, Defender & Entra ID expertise.','about.b3':'✓ ITSM, SLA/KPI governance and service improvement.','about.b4':'✓ Vendor coordination, security and operational risk control.','about.b5':'✓ Clear communication in French and English internationally.',
        'exp.kicker':'Experience','exp.title':'Career path.','j1t':'Infrastructure & Support Manager','j1a':'Owned infrastructure operations, continuity and security compliance.','j1b':'Led a 6-person N1–N3 team (incl. 2 apprentices) and cut MTTR by 80%.','j1c':'Deployed Defender for Endpoint, MFA and network / Autopilot projects.','j1d':'Dashboards and reporting for management and budget decisions.','j2t':'Infrastructure & Delivery Manager — Paris 2024','j2tag':'Fixed-term Olympic Games engagement','j2a':'Designed and operated IT infrastructure for 250+ users across sites.','j2b':'Single point of contact for departments; end-to-end operations.','j2c':'Business apps, access governance, compliance and audit traceability.','j2d':'Coordinated vendors, procurement and IT budget planning.','j3t':'Group IT Manager','j3tag':'Transition mission','j3a':'Ran IT operations and business apps in a fast-scaling SaaS.','j3b':'IAM via Okta and Google Admin, SaaS access management.','j3c':'Purchases, budget follow-up, vendors and contractors.','j3d':'IT standards, GDPR and internal controls with security.','j4t':'IT Manager','j4tag':'Ended by Snap Inc. Paris office closure','j4a':'Managed infrastructure and apps for 180+ international users.','j4b':'Supported Windows, macOS, Linux; managed Okta, Google Admin and Jira.','j4c':'Servers, Wi-Fi, switches and office infrastructure; −15% SaaS cost.','j5t':'Technical Support Analyst','j5a':'Multi-country IT support via ServiceNow with 99%+ SLA compliance.','j5b':'Citrix Workspace, Active Directory, AirWatch MDM, Azure MDM, ServiceNow.','j5c':'Endpoints, meeting rooms and network in a regulated environment.','j6t':'Support Technician / Desktop Support','j6a':'N1/N2/N3 support, Microsoft 365 & Azure admin, Windows migrations.','j6b':'GLPI, G Suite, Veeam, Cisco, O365, Azure Admin; +25% network availability.','j6c':'Installed and configured workstations, telephony, video and network.','j7t':'Healthcare Assistant & Self-Directed IT Learner','j7c':'Healthcare establishments (multi-site) · Internal medicine · Surgery · Rehabilitation care','j7a':'Built communication, teamwork and high-pressure operational skills.','j7b':'Built foundational IT skills independently: OS installs, hardware, troubleshooting.',
        'imp.kicker':'Impact & achievements','imp.title':'Concrete outcomes, not just responsibilities.','imp.1t':'Support turnaround — HBS','imp.1a':'24/7 multi-site operations for 600+ users.','imp.1b':'Led a 6-person N1–N3 team.','imp.1c':'Improved service performance and SLAs.','imp.res':'Results','imp.1m1':'MTTR','imp.1m2':'Users','imp.1m3':'Uptime','imp.2t':'IT operations — Paris 2024','imp.2a':'IT infrastructure for 250+ multi-site users.','imp.2b':'Single point of contact for departments.','imp.2c':'Access governance, compliance and audit.','imp.res2':'Results','imp.2m1':'Users','imp.2m2':'Sites','imp.2m3':'Coordination','imp.3t':'Service, security & modernisation','imp.3a':'Multi-country support with 99%+ SLA (Dechert).','imp.3b':'Deployed Autopilot, Defender for Endpoint and MFA.','imp.3c':'Optimised cost and network availability.','imp.res3':'Results','imp.3m1':'SLA met','imp.3m2':'SaaS cost','imp.3m3':'Network uptime',
        'ex.kicker':'My expertise','ex.title':'What I bring to an organisation.','ex.1t':'Infrastructure','ex.1p':'Design, deployment and operation of secure, resilient infrastructure.','ex.2t':'Service Delivery & ITSM','ex.2p':'ITIL, incidents, problems, changes, SLA, KPIs and continuous improvement.','ex.3t':'Cloud & Microsoft','ex.3p':'Azure, Microsoft 365, Entra ID, hybrid cloud, security and collaboration.','ex.4t':'Cybersecurity','ex.4p':'IAM, MFA, data protection, awareness and risk management.','ex.5t':'Leadership','ex.5p':'Team management, talent development, communication and performance culture.','ex.6t':'Governance & Budget','ex.6p':'Budget management, vendor management, reporting and business alignment.','ex.tools':'Technology ecosystem',
        'lead.kicker':'Leadership','lead.title':'What colleagues say.','r1':'I was lucky enough to recruit and work alongside Roland during Paris 2024. If you are looking for an IT manager, Roland is THE catch. Committed, reliable, organised, with a complete 360° vision.','r1s':'Human Resources Director','r2':'Roland was a fantastic colleague and a key member of my team during the Games. Very skilled, always willing to help, organised and meticulous.','r2s':'Sponsorship Operations','r3':'It was a pleasure working with Roland. An absolute gem who worked very hard to deliver all Paris 2024 milestones. Highly recommended.','r3s':'Consultant · The iLUKA Collective','r4':'Roland is such a team player — always willing to help, whatever the task. Great at his job, skilled and experienced.','r4s':'Managing Director · The iLUKA Collective','r5':'Roland is a reliable teammate with strong technical knowledge. He successfully ran the day-to-day IT operations of an entire office.','r5s':'IT Support Specialist','r6':'I strongly recommend Roland for any IT management role. Dependable, patient and a pleasure to work with, with strong problem-solving.','r6s':'Global Account Director · The iLUKA Collective',
        'ct.kicker':'Contact','ct.title':"Let's talk about your IT challenges.",'ct.opent':'Open to new opportunities','ct.openp':'I am looking for permanent roles or missions in stimulating environments where I can bring my expertise and leadership.','ct.roles':'Target roles','ct.reach':'Get in touch','ct.show':'Show my contact details','ct.btn':'Contact me →','ct.cvfr':'CV Français','ct.cven':'English CV',
        'foot.copy':'© 2026 Roland Dzoagbe. All rights reserved.'
      }
    };
    const nodes=[...document.querySelectorAll('[data-i18n]')];
    nodes.forEach(n=>{T.fr[n.dataset.i18n]=n.innerHTML});
    function setLang(lang){nodes.forEach(n=>{const v=T[lang][n.dataset.i18n];if(v!=null)n.innerHTML=v});document.documentElement.lang=lang;frBtn.classList.toggle('active',lang==='fr');enBtn.classList.toggle('active',lang==='en');try{localStorage.setItem('rd-lang',lang)}catch(e){}}
    const frBtn=document.getElementById('frBtn'),enBtn=document.getElementById('enBtn');
    let lang='fr';try{lang=localStorage.getItem('rd-lang')||((navigator.language||'fr').toLowerCase().startsWith('en')?'en':'fr')}catch(e){}
    setLang(lang);
    frBtn.onclick=()=>setLang('fr');enBtn.onclick=()=>setLang('en');
    const root=document.documentElement;let theme='light';try{theme=localStorage.getItem('rd-theme')||'light'}catch(e){}if(theme==='dark')root.dataset.theme='dark';
    document.getElementById('themeBtn').onclick=()=>{const dark=root.dataset.theme==='dark';if(dark)delete root.dataset.theme;else root.dataset.theme='dark';try{localStorage.setItem('rd-theme',dark?'light':'dark')}catch(e){}};
    var navwrap=document.querySelector('.navlinks');
    function closeMenu(){if(navwrap)navwrap.style.display='';}
    const menu=document.getElementById('menuBtn');menu.onclick=()=>{const n=navwrap;const open=n.style.display==='flex';if(open){n.style.display='';return;}n.style.display='flex';n.style.position='absolute';n.style.top='64px';n.style.left='12px';n.style.right='12px';n.style.flexDirection='column';n.style.alignItems='stretch';n.style.background=getComputedStyle(root).getPropertyValue('--surface');n.style.padding='10px';n.style.border='1px solid var(--line)';n.style.borderRadius='14px';n.style.boxShadow='var(--shadow)';};

    /* Active nav by filename + reveal on scroll */
    const navlinksA=[...document.querySelectorAll(".navlinks a")];
    var __pg=(location.pathname.split("/").pop()||"index.html");if(!__pg)__pg="index.html";
    navlinksA.forEach(function(a){a.classList.toggle("active",a.getAttribute("href")===__pg);});
    var __obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add("visible");});},{threshold:.06});
    document.querySelectorAll(".reveal").forEach(function(el){__obs.observe(el);});

    /* Contact dropdowns (hero + contact page) */
    (function(){
      var drops=[...document.querySelectorAll('.cdrop')];
      function closeAll(except){drops.forEach(function(d){if(d!==except){d.classList.remove('open');var b=d.querySelector('button');if(b)b.setAttribute('aria-expanded','false');}});}
      drops.forEach(function(d){var b=d.querySelector('button');if(!b)return;b.addEventListener('click',function(e){e.stopPropagation();var willOpen=!d.classList.contains('open');closeAll(d);d.classList.toggle('open',willOpen);b.setAttribute('aria-expanded',willOpen);});});
      document.addEventListener('click',function(e){drops.forEach(function(d){if(!d.contains(e.target)){d.classList.remove('open');var b=d.querySelector('button');if(b)b.setAttribute('aria-expanded','false');}});});
      document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll(null);});
    })();

    /* Auto-update: reload the page when a newer build is published */
    (function(){
      var meta=document.querySelector('meta[name="build"]');
      var current=meta?meta.getAttribute('content'):null;
      if(!current||current==='BUILD_ID')return;
      function check(){
        fetch('./version.json?t='+new Date().getTime(),{cache:'no-store'})
          .then(function(r){return r.ok?r.json():null;})
          .then(function(d){
            if(d&&d.build&&d.build!==current){
              location.replace(location.pathname+'?v='+encodeURIComponent(d.build)+location.hash);
            }
          }).catch(function(){});
      }
      setInterval(check,30000);
      document.addEventListener('visibilitychange',function(){if(!document.hidden)check();});
    })();
