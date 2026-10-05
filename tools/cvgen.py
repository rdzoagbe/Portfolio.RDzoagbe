# -*- coding: utf-8 -*-
"""Roland Dzoagbe CV generator (EN + FR), rebuilt to match the published layout."""
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_RIGHT
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle, HRFlowable, KeepTogether)

OUTDIR = '/home/user/Portfolio.RolandDzoagbe/'
INK = colors.HexColor('#12212f')
BLUE = colors.HexColor('#0b56b0')
GREY = colors.HexColor('#556072')
RULE = colors.HexColor('#c9d4e0')

PW, PH = A4
LM, RM, TM, BM = 42.52, 48.52, 38.0, 42.0
FW = PW - LM - RM          # 504.24
IND = 6.0                  # body text sits at 48.52

S = {}
S['name'] = ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=19, leading=21.5,
                           textColor=INK, leftIndent=IND, spaceAfter=4.2)
S['role'] = ParagraphStyle('role', fontName='Helvetica', fontSize=9.6, leading=11.6,
                           textColor=BLUE, leftIndent=IND, spaceAfter=4.6)
S['contact'] = ParagraphStyle('contact', fontName='Helvetica', fontSize=8.4, leading=12.0,
                              textColor=GREY, leftIndent=IND, spaceAfter=0)
S['sec'] = ParagraphStyle('sec', fontName='Helvetica-Bold', fontSize=10.3, leading=12.4,
                          textColor=BLUE, leftIndent=IND, spaceBefore=7.8, spaceAfter=1.4)
S['body'] = ParagraphStyle('body', fontName='Helvetica', fontSize=8.9, leading=12.4,
                           textColor=INK, leftIndent=IND, spaceAfter=0)
S['bul'] = ParagraphStyle('bul', fontName='Helvetica', fontSize=8.7, leading=11.6,
                          textColor=INK, leftIndent=15.0, spaceAfter=1.0)
S['comp'] = ParagraphStyle('comp', fontName='Helvetica', fontSize=8.7, leading=12.0,
                           textColor=INK, leftIndent=IND, spaceAfter=1.0)
S['jt'] = ParagraphStyle('jt', fontName='Helvetica-Bold', fontSize=9.6, leading=11.6, textColor=INK)
S['jd'] = ParagraphStyle('jd', fontName='Helvetica', fontSize=8.4, leading=11.6,
                         textColor=GREY, alignment=TA_RIGHT)
S['ctx'] = ParagraphStyle('ctx', fontName='Helvetica', fontSize=8.3, leading=11.4,
                          textColor=GREY, leftIndent=IND, spaceBefore=0.5, spaceAfter=0.6)
S['env'] = ParagraphStyle('env', fontName='Helvetica', fontSize=8.1, leading=10.6,
                          textColor=GREY, leftIndent=IND, spaceAfter=1.6)
S['kw'] = ParagraphStyle('kw', fontName='Helvetica-Bold', fontSize=8.8, leading=11.2,
                         textColor=INK, leftIndent=IND, spaceAfter=4.4)

def rule(w=0.5, sb=0.0, sa=2.0):
    return HRFlowable(width=FW - IND, thickness=w, color=RULE, spaceBefore=sb,
                      spaceAfter=sa, hAlign='RIGHT')

def section(F, title):
    F.append(Paragraph(title, S['sec']))
    F.append(rule())

def job(F, j, env_label, first=False):
    t = Table([[Paragraph(j['role'], S['jt']), Paragraph(j['date'], S['jd'])]],
              colWidths=[FW * 0.72, FW * 0.28], hAlign='LEFT')
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
                           ('LEFTPADDING', (0, 0), (-1, -1), 0),
                           ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                           ('TOPPADDING', (0, 0), (-1, -1), 0),
                           ('BOTTOMPADDING', (0, 0), (-1, -1), 0)]))
    head = [t, Paragraph('<font color="#12212f"><b>%s</b></font> \u00b7 <i>%s</i>' % (j['company'], j['ctx']), S['ctx'])]
    if j['env']:
        head.append(Paragraph('<b>%s</b> %s' % (env_label, j['env']), S['env']))
    head.append(Paragraph('\u2022  ' + j['bullets'][0], S['bul']))
    F.append(Spacer(1, 1.5 if first else 5.0))
    F.append(KeepTogether(head))
    for b in j['bullets'][1:]:
        F.append(Paragraph('\u2022  ' + b, S['bul']))

# ----------------------------------------------------------------- content
C = {'en': {'jobs': [{'role': 'Independent Projects — Product Design &amp; Delivery',
                  'company': 'Independent',
                  'date': 'January 2026 – Present',
                  'ctx': 'Personal projects, AI-assisted development · Actively seeking a permanent role · '
                         'Île-de-France',
                  'env': None,
                  'bullets': ['<b>StackLens</b> (stacklens.fr) — SaaS governance for European SMBs: application '
                              'inventory, licence tracking, access mapping, wasted seats and ex-employees with '
                              'active access, offboarding workflows and audit readiness; GDPR-native, EU-hosted.',
                              '<b>Ahenora</b> (iOS, Android, web) — family-organisation app published on the App '
                              'Store and Google Play: tasks, calendar, chores, meals and school paperwork in one '
                              'shared private space; AI document scanning, secure vault, 4 languages.',
                              'Continuous learning: AZ-104 administrator curriculum (Alison) and ITIL 4 Foundation '
                              'training.']},
                 {'role': 'Infrastructure &amp; Support Manager',
                  'company': 'Host Broadcast Services (HBS)',
                  'date': 'March 2025 – December 2025',
                  'ctx': 'International broadcast operations · 600+ users · 6-person N1–N3 team (incl. 2 interns) · '
                         'Mission-critical 24/7',
                  'env': 'Entra ID (PIM, Conditional Access, MFA) · Intune · Autopilot · Defender for Endpoint · '
                         'Windows Server · Firewalls · PowerShell',
                  'bullets': ['Owned site-level IT infrastructure across international broadcast sites, ensuring '
                              'business continuity, security compliance and executive stakeholder alignment.',
                              'Led and restructured the N1–N3 support function, overhauling incident and change '
                              'management: 80% MTTR reduction and marked SLA improvement.',
                              'Deployed enterprise security across multi-site environments — Defender for Endpoint, '
                              'MFA, Conditional Access, firewall policies — and applied PIM for temporary privilege '
                              'elevation; automated recurring tasks with PowerShell.',
                              'Coordinated critical incidents and crisis management (rapid containment, multi-level '
                              'communication, resolution tracking); kept BCP/DRP procedures in continuous readiness.',
                              'Delivered infrastructure evolution — network modernization, Windows Server upgrades, '
                              'Autopilot/Intune — for 30% faster provisioning and standardized rollouts.',
                              'Built executive dashboards and reporting to optimize budgets and enable data-driven '
                              'decisions; maintained documentation and knowledge base.']},
                 {'role': 'IT Manager — Paris 2024',
                  'company': 'The iLUKA Collective',
                  'date': 'March 2024 – March 2025',
                  'ctx': 'Olympic &amp; Paralympic engagement · 250+ users · Multi-site, mission-critical · Kingston '
                         'upon Thames, UK',
                  'env': 'Eventim ticketing · CRM · Access control · GDPR access governance · SLA and GTR/GTI '
                         'reporting',
                  'bullets': ['Led end-to-end IT operations for the Paris 2024 Olympic &amp; Paralympic Games as '
                              'single point of contact for every department across multiple event sites.',
                              'Designed and operated the IT infrastructure for 250+ users; owned the '
                              'business-application stack (Eventim ticketing, CRM, access control, reporting '
                              'workflows).',
                              'Ensured GDPR access governance, audit traceability and security compliance in '
                              'mission-critical event operations.',
                              'Tracked contractual commitments (SLA, GTR/GTI) and produced dashboards and executive '
                              'reporting for client and leadership.',
                              'Coordinated vendors, suppliers and event platforms; managed IT budget and '
                              'procurement.']},
                 {'role': 'Corporate IT Lead',
                  'company': 'AKUR8 (InsurTech SaaS)',
                  'date': 'May 2023 – October 2023',
                  'ctx': 'Transition mission · 50+ international users · High-growth SaaS',
                  'env': 'Okta · Google Workspace (Google Admin) · SaaS administration · ITIL change management',
                  'bullets': ['Led IT operations and business-application environments in a fast-scaling, '
                              'GDPR-compliant SaaS company.',
                              'Administered IAM (Okta, Google Admin) — users, groups, rights and SaaS access for 50+ '
                              'international users.',
                              'Managed IT budget, purchasing and vendor/contractor relationships with cost '
                              'optimization; handled escalations and software-upgrade coordination under ITIL change '
                              'management.',
                              'Collaborated with the security team on corporate IT standards; drove documentation, '
                              'process improvement and staff development.']},
                 {'role': 'IT Manager',
                  'company': 'Zenly (Snap Inc. Group)',
                  'date': 'July 2022 – March 2023',
                  'ctx': '180+ international users · Scale-up · Ended with Snap Inc. Paris office closure',
                  'env': 'Okta · Google Workspace · Windows · macOS · Linux · JIRA · Slack · WiFi and switching',
                  'bullets': ['Managed end-to-end IT infrastructure and end-user support for 180+ international '
                              'employees across Windows, macOS and Linux.',
                              'Administered Okta and Google Admin (onboarding/offboarding, users, groups); ran JIRA '
                              'ticketing and Slack collaboration.',
                              'Reduced SaaS licensing costs by 15% through access audits; improved documentation, '
                              'processes and DRP readiness.',
                              'Installed and supervised infrastructure equipment (servers, WiFi, switches); '
                              'coordinated vendors; troubleshot and escalated network incidents with daily '
                              'reporting.']},
                 {'role': 'Technical Support Analyst',
                  'company': 'Dechert LLP',
                  'date': 'June 2021 – August 2022',
                  'ctx': 'International law firm (Paris, Luxembourg, Brussels) · GDPR-regulated',
                  'env': 'ServiceNow · Active Directory · Windows Server · Citrix Workspace · AirWatch · Azure MDM · '
                         'Cisco',
                  'bullets': ['Delivered multi-country IT support via ServiceNow, maintaining 99%+ SLA compliance in '
                              'a regulated environment.',
                              'Administered Active Directory, Windows Server and Citrix Workspace; managed the '
                              'mobile fleet (AirWatch, Azure MDM).',
                              'Configured Cisco meeting rooms (Teams, Skype, conferencing); handled network '
                              'troubleshooting (HTTP, DNS, TCP/IP); documented interventions with weekly '
                              'reporting.']},
                 {'role': 'Desktop Support Technician',
                  'company': 'The American University of Paris',
                  'date': 'April 2021 – May 2021',
                  'ctx': '~200 users · Tier 1/2',
                  'env': None,
                  'bullets': ['Installed and configured workstations, software and equipment (telephony, '
                              'video-conferencing, network); maintained the IT estate and mobile fleet '
                              '(iOS/Android).',
                              'Provided N1/N2 support for 200 users; managed Active Directory accounts; diagnosed '
                              'and resolved system, network and equipment incidents; produced technical '
                              'documentation.']},
                 {'role': 'IT Technician',
                  'company': 'Artemys Paris',
                  'date': 'February 2018 – February 2021',
                  'ctx': 'Clients: DBV Technologies, OPCO Santé · 200+ users · 2 sites · Tier 2/3',
                  'env': 'Microsoft 365 · Azure · Google Workspace · Windows Server · Cisco switches · GLPI · Veeam',
                  'bullets': ['Provided N2/N3 support and administered Microsoft 365, Azure and Google Workspace '
                              'environments.',
                              'Led Windows Server and workstation migration projects; configured Cisco switches — '
                              '25% improvement in network availability.',
                              'Managed GLPI ticketing, Veeam backup, O365/Azure Admin and endpoint '
                              'inventory/enrolment; optimized onboarding/offboarding and reinforced IT '
                              'documentation.']},
                 {'role': 'Support Technician (N1/N2)',
                  'company': 'Cabinet Alain Bensoussan',
                  'date': 'February 2017 – March 2018',
                  'ctx': '~200 users',
                  'env': None,
                  'bullets': ['First formal IT role: Active Directory administration, IT estate and mobile-fleet '
                              'management, equipment deployment and user support; technical documentation and '
                              'deployment procedures.']}],
        'cert': 'ITIL 4 Foundation — training completed, official exam scheduled · Microsoft Azure Administrator — '
                'Alison, AZ-104 curriculum (2026) · Cybersecurity — Google / Coursera (2024) · Introduction to '
                'Cybersecurity — Cisco (2023). Accreditation: Paris 2024 Olympic &amp; Paralympic Games — access to '
                'secured event sites after administrative security screening.',
        'edu': 'Education: 3W Academy — Computer Software &amp; Media Applications (2017) · High School Diploma — '
               'Ghana. Languages: English &amp; French (bilingual).',
        'comps': [('Infrastructure &amp; Cloud:',
                   ' Microsoft 365, Azure, Entra ID (Governance, PIM, Conditional Access), Intune, Autopilot, SCCM, '
                   'Windows Server, VMware, Hyper-V'),
                  ('Security, Identity &amp; Compliance:',
                   ' Identity &amp; privileged access (Entra ID, Okta): just-in-time elevation (PIM), Conditional '
                   'Access, MFA, access reviews; Microsoft Defender, firewall policies, security hardening, GDPR, '
                   'BCP/DRP, audit &amp; access governance'),
                  ('Service Management:',
                   ' ITIL, ITSM (ServiceNow), SLA / KPI / GTR-GTI, incident · problem · change management, '
                   'dashboards &amp; executive reporting'),
                  ('Leadership &amp; Delivery:',
                   ' N1–N3 team management, vendor &amp; budget management, crisis management, stakeholder '
                   'alignment, documentation &amp; upskilling'),
                  ('Identity, Endpoints &amp; Automation:',
                   ' Okta, Google Admin, IAM, endpoint lifecycle (Windows/macOS/Linux), PowerShell, Bash, generative '
                   'AI tooling (AI-assisted development &amp; automation)')],
        'early': 'Healthcare (multiple facilities) — Healthcare Assistant &amp; Self-Taught IT · March 2009 – '
                 'February 2017. Internal medicine, surgery, aftercare &amp; rehabilitation. Built the adaptability, '
                 'composure under pressure and service orientation behind my IT operations career; self-taught IT in '
                 'parallel (OS installs, hardware, custom builds, troubleshooting) — the foundation of a deliberate '
                 'move into IT.',
        's_comp': 'SKILLS',
        's_exp': 'PROFESSIONAL EXPERIENCE',
        's_early': 'EARLIER CAREER — HEALTHCARE',
        's_cert': 'CERTIFICATIONS',
        's_edu': 'EDUCATION &amp; LANGUAGES',
        's_sum': 'PROFESSIONAL SUMMARY',
        'role': 'IT Infrastructure &amp; Identity Access Leader',
        'kw': 'Entra ID · Okta · Microsoft 365 · Intune · Azure · ITIL · ServiceNow',
        'summary': 'IT infrastructure and identity leader with 10+ years running secure, multi-site IT for '
                   'international organizations, including the Paris 2024 Olympic &amp; Paralympic Games. Led a '
                   'six-person N1–N3 team for a 600-user, 24/7 broadcast operation. Hands-on expertise in identity '
                   'and access (Entra ID with PIM and Conditional Access, Okta, Google Workspace), Microsoft 365, '
                   'Intune and ITIL service management, with vendor and budget ownership. Bilingual English/French.',
        'env_label': 'Environment:'},
 'fr': {'jobs': [{'role': 'Projets indépendants — Conception &amp; mise en production',
                  'company': 'Indépendant',
                  'date': 'Janv. 2026 – Aujourd’hui',
                  'ctx': 'Projets personnels, développement assisté par IA · En recherche active d’un poste en CDI · '
                         'Île-de-France',
                  'env': None,
                  'bullets': ['<b>StackLens</b> (stacklens.fr) — gouvernance des SaaS pour les PME européennes : '
                              'inventaire des applications, suivi des licences, cartographie des accès, sièges '
                              'inutilisés et anciens collaborateurs encore actifs, workflows d’offboarding et '
                              'préparation aux audits ; RGPD, hébergé en Europe.',
                              '<b>Ahenora</b> (iOS, Android, web) — application d’organisation familiale publiée sur '
                              'l’App Store et Google Play : tâches, calendrier, corvées, repas et paperasse scolaire '
                              'dans un espace partagé et privé ; numérisation par IA, coffre-fort sécurisé ; 4 '
                              'langues.',
                              'Formation continue : programme AZ-104 (Alison) et formation ITIL 4 Foundation.']},
                 {'role': 'Responsable Infrastructure &amp; Support',
                  'company': 'Host Broadcast Services (HBS)',
                  'date': 'Mars 2025 – Déc. 2025',
                  'ctx': 'Opérations de diffusion internationales · 600+ utilisateurs · Équipe N1–N3 de 6 (dont 2 '
                         'stagiaires) · Critique 24/7',
                  'env': 'Entra ID (PIM, accès conditionnel, MFA) · Intune · Autopilot · Defender for Endpoint · '
                         'Windows Server · Pare-feu · PowerShell',
                  'bullets': ['Responsabilité de l’infrastructure IT au niveau des sites de diffusion '
                              'internationaux, garantissant continuité d’activité, conformité de sécurité et '
                              'alignement avec la direction.',
                              'Direction et restructuration de la fonction support N1–N3, refonte de la gestion des '
                              'incidents et des changements : réduction du MTTR de 80 % et nette amélioration des '
                              'SLA.',
                              'Déploiement sécurité multi-sites — Defender for Endpoint, MFA, accès conditionnel, '
                              'pare-feu — et PIM pour l’élévation temporaire de privilèges ; automatisation '
                              'PowerShell.',
                              'Coordination des incidents critiques et gestion de crise (confinement rapide, '
                              'communication multi-niveaux, suivi de résolution) ; maintien des procédures PCA/PRA.',
                              'Projets d’évolution — modernisation réseau, mises à niveau Windows Server, '
                              'Autopilot/Intune — provisioning 30 % plus rapide.',
                              'Tableaux de bord et reporting exécutif pour le pilotage budgétaire ; documentation et '
                              'base de connaissances.']},
                 {'role': 'Responsable IT — Paris 2024',
                  'company': 'The iLUKA Collective',
                  'date': 'Mars 2024 – Mars 2025',
                  'ctx': 'Engagement Olympique &amp; Paralympique · 250+ utilisateurs · Multi-sites, critique · '
                         'Kingston upon Thames, R.-U.',
                  'env': 'Billetterie Eventim · CRM · Contrôle d’accès · Gouvernance des accès RGPD',
                  'bullets': ['Pilotage de l’IT de bout en bout des Jeux Olympiques &amp; Paralympiques de Paris '
                              '2024 en tant que point de contact unique de tous les départements sur plusieurs '
                              'sites.',
                              'Conception et exploitation de l’infrastructure IT pour 250+ utilisateurs ; '
                              'responsabilité du parc applicatif métier (billetterie Eventim, CRM, contrôle d’accès, '
                              'reporting).',
                              'Gouvernance des accès RGPD, traçabilité d’audit et conformité de sécurité en '
                              'opérations événementielles critiques.',
                              'Suivi des engagements contractuels (SLA, GTR/GTI) et production de tableaux de bord '
                              'et de reporting exécutif.',
                              'Coordination des prestataires et plateformes événementielles ; budget IT et achats.']},
                 {'role': 'Corporate IT Lead',
                  'company': 'AKUR8 (InsurTech SaaS)',
                  'date': 'Mai 2023 – Oct. 2023',
                  'ctx': 'Mission de transition · 50+ utilisateurs internationaux · SaaS en forte croissance',
                  'env': 'Okta · Google Workspace (Google Admin) · Administration SaaS · Gestion des changements '
                         'ITIL',
                  'bullets': ['Pilotage des opérations IT et des applications métier dans une entreprise SaaS en '
                              'forte croissance, conforme RGPD.',
                              'Administration IAM (Okta, Google Admin) — utilisateurs, groupes, droits et accès SaaS '
                              'pour 50+ utilisateurs internationaux.',
                              'Gestion du budget IT, des achats et des relations prestataires/sous-traitants avec '
                              'optimisation des coûts ; escalades et coordination des mises à niveau selon ITIL.',
                              'Collaboration avec l’équipe sécurité sur les standards IT ; documentation, '
                              'amélioration des processus et développement des équipes.']},
                 {'role': 'Responsable IT',
                  'company': 'Zenly (Groupe Snap Inc.)',
                  'date': 'Juil. 2022 – Mars 2023',
                  'ctx': '180+ utilisateurs internationaux · Scale-up · Fin suite à la fermeture du bureau parisien '
                         'de Snap Inc.',
                  'env': 'Okta · Google Workspace · Windows · macOS · Linux · JIRA · Slack · WiFi et commutation',
                  'bullets': ['Gestion de l’infrastructure IT et du support pour 180+ collaborateurs internationaux '
                              'sous Windows, macOS et Linux.',
                              'Administration Okta et Google Admin (onboarding/offboarding, utilisateurs, groupes) ; '
                              'gestion des tickets JIRA et collaboration Slack.',
                              'Réduction de 15 % des coûts de licences SaaS via des audits d’accès ; améliorations '
                              'documentation, processus et PRA.',
                              'Installation et supervision des équipements (serveurs, WiFi, commutateurs) ; '
                              'coordination prestataires ; reporting quotidien.']},
                 {'role': 'Analyste Support Technique',
                  'company': 'Dechert LLP',
                  'date': 'Juin 2021 – Août 2022',
                  'ctx': 'Cabinet d’avocats international (Paris, Luxembourg, Bruxelles) · RGPD',
                  'env': 'ServiceNow · Active Directory · Windows Server · Citrix Workspace · AirWatch · Azure MDM · '
                         'Cisco',
                  'bullets': ['Support IT multi-pays via ServiceNow, avec un respect des SLA supérieur à 99 % en '
                              'environnement régulé.',
                              'Administration Active Directory, Windows Server et Citrix Workspace ; gestion de la '
                              'flotte mobile (AirWatch, Azure MDM).',
                              'Configuration des salles Cisco (Teams, Skype, conférences) ; dépannage réseau (HTTP, '
                              'DNS, TCP/IP) ; documentation et rapports hebdomadaires.']},
                 {'role': 'Technicien Support Bureautique',
                  'company': 'The American University of Paris',
                  'date': 'Avr. 2021 – Mai 2021',
                  'ctx': '~200 utilisateurs · N1/N2',
                  'env': None,
                  'bullets': ['Installation et configuration des postes, logiciels et équipements (téléphonie, '
                              'visioconférence, réseau) ; maintenance du parc et de la flotte mobile (iOS/Android).',
                              'Support N1/N2 pour 200 utilisateurs ; gestion des comptes Active Directory ; '
                              'diagnostic et résolution des incidents système, réseau et équipement ; documentation '
                              'technique.']},
                 {'role': 'Technicien IT / Support de proximité',
                  'company': 'Artemys Paris',
                  'date': 'Févr. 2018 – Févr. 2021',
                  'ctx': 'Clients : DBV Technologies, OPCO Santé · 200+ utilisateurs · 2 sites · N2/N3',
                  'env': 'Microsoft 365 · Azure · Google Workspace · Windows Server · Commutateurs Cisco · GLPI · '
                         'Veeam',
                  'bullets': ['Support N2/N3 et administration des environnements Microsoft 365, Azure et Google '
                              'Workspace.',
                              'Projets de migration Windows Server et postes ; configuration de commutateurs Cisco — '
                              'amélioration de 25 % de la disponibilité réseau.',
                              'Gestion GLPI, sauvegarde Veeam, O365/Azure Admin et inventaire/enrôlement des postes '
                              '; optimisation onboarding/offboarding et documentation.']},
                 {'role': 'Technicien Support (N1/N2)',
                  'company': 'Cabinet Alain Bensoussan',
                  'date': 'Févr. 2017 – Mars 2018',
                  'ctx': '~200 utilisateurs',
                  'env': None,
                  'bullets': ['Premier poste IT : administration Active Directory, gestion du parc et de la flotte '
                              'mobile, déploiement d’équipements et support ; documentation technique et '
                              'procédures.']}],
        'cert': 'ITIL 4 Foundation — formation terminée, examen officiel à venir · Microsoft Azure Administrator — '
                'Alison, programme AZ-104 (2026) · Cybersécurité — Google / Coursera (2024) · Introduction à la '
                'cybersécurité — Cisco (2023). Accréditation : JOP Paris 2024 — accès aux sites sécurisés (criblage '
                'administratif).',
        'edu': 'Formation : 3W Academy — Développement logiciel &amp; applications média (2017) · Baccalauréat — '
               'Ghana. Langues : Anglais &amp; Français (bilingue).',
        'comps': [('Infrastructure &amp; Cloud:',
                   ' Microsoft 365, Azure, Entra ID (gouvernance, PIM, accès conditionnel), Intune, Autopilot, SCCM, '
                   'Windows Server, VMware, Hyper-V'),
                  ('Sécurité, Identités &amp; Conformité:',
                   ' Identités &amp; accès privilégiés (Entra ID, Okta) : élévation à la demande (PIM), accès '
                   'conditionnel, MFA, revues d’accès ; Microsoft Defender, politiques de pare-feu, durcissement, '
                   'RGPD, PCA/PRA, audit &amp; gouvernance des accès'),
                  ('Gestion des services:',
                   ' ITIL, ITSM (ServiceNow), SLA / KPI / GTR-GTI, gestion des incidents · problèmes · changements, '
                   'tableaux de bord &amp; reporting exécutif'),
                  ('Management &amp; Delivery:',
                   ' management d’équipes N1–N3, gestion prestataires &amp; budgets, gestion de crise, alignement '
                   'des parties prenantes, documentation &amp; montée en compétences'),
                  ('Identité, Postes &amp; Automatisation:',
                   ' Okta, Google Admin, IAM, cycle de vie des postes (Windows/macOS/Linux), PowerShell, Bash, '
                   'outils d’IA générative (développement assisté &amp; automatisation)')],
        'early': 'Établissements de santé (multi-sites) — Aide-soignant polyvalent &amp; autodidacte en informatique '
                 '· Mars 2009 – Fév. 2017. Médecine interne, chirurgie, soins de suite et réadaptation. '
                 'Adaptabilité, sang-froid et sens du service qui fondent mon parcours en opérations IT ; pratique '
                 'IT en autodidacte en parallèle (OS, matériel, montages, dépannage) — la base d’une reconversion '
                 'assumée.',
        's_comp': 'COMPÉTENCES',
        's_exp': 'EXPÉRIENCE PROFESSIONNELLE',
        's_early': 'DÉBUT DE CARRIÈRE — SANTÉ',
        's_cert': 'CERTIFICATIONS',
        's_edu': 'FORMATION ET LANGUES',
        's_sum': 'PROFIL PROFESSIONNEL',
        'role': 'Responsable Infrastructure IT &amp; Gestion des identités',
        'kw': 'Entra ID · Okta · Microsoft 365 · Intune · Azure · ITIL · ServiceNow',
        'summary': 'Responsable infrastructure IT et identités, plus de 10 ans à exploiter et sécuriser des SI '
                   'multi-sites pour des organisations internationales, dont les Jeux Olympiques &amp; Paralympiques '
                   'de Paris 2024. Direction d’une équipe N1–N3 de six personnes pour une opération de diffusion '
                   '24/7 de 600 utilisateurs. Expertise concrète en identités et accès (Entra ID avec PIM et accès '
                   'conditionnel, Okta, Google Workspace), Microsoft 365, Intune et gestion des services ITIL. '
                   'Bilingue français/anglais.',
        'env_label': 'Environnement :'}}

CONTACT1 = 'rolanddzoagbe@gmail.com  ·  +33 7 82 88 46 46  ·  Bondy, Île-de-France, France  ·  linkedin.com/in/r-dz  · '
CONTACT2 = 'rdzoagbe.github.io/Portfolio.RDzoagbe'

def build(lang, out):
    c = C[lang]
    F = []
    F.append(Paragraph('ROLAND DZOAGBE', S['name']))
    F.append(Paragraph(c['role'], S['role']))
    F.append(Paragraph(c['kw'], S['kw']))
    F.append(Paragraph(CONTACT1, S['contact']))
    F.append(Paragraph(CONTACT2, S['contact']))
    F.append(rule(0.8, sb=5.0, sa=0.0))
    section(F, c['s_sum'])
    F.append(Paragraph(c['summary'], S['body']))
    section(F, c['s_comp'])
    for lab, txt in c['comps']:
        F.append(Paragraph('<b>%s</b>%s' % (lab, txt), S['comp']))
    section(F, c['s_exp'])
    for i, j in enumerate(c['jobs']):
        job(F, j, c['env_label'], first=(i == 0))
    section(F, c['s_early'])
    F.append(Paragraph(c['early'], S['body']))
    section(F, c['s_cert'])
    F.append(Paragraph(c['cert'], S['body']))
    section(F, c['s_edu'])
    F.append(Paragraph(c['edu'], S['body']))
    doc = BaseDocTemplate(out, pagesize=A4, leftMargin=LM, rightMargin=RM, topMargin=TM, bottomMargin=BM,
                          title='Roland Dzoagbe \u2014 CV', author='Roland Dzoagbe',
                          subject=c['role'].replace('&amp;', '&'))
    fr = Frame(LM, BM, FW, PH - TM - BM, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id='p', frames=[fr])])
    doc.build(F)
    return out

for lang, fn in (('en', 'Roland_Dzoagbe_EN.pdf'), ('fr', 'Roland_Dzoagbe_FR.pdf')):
    print('built', build(lang, OUTDIR + fn))
