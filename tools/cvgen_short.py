# -*- coding: utf-8 -*-
"""Short, results-first CV for Roland Dzoagbe (FR + EN). Writes the two CV PDFs served by the site (repo root)."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle, HRFlowable, KeepTogether)

OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # repo root
INK = colors.HexColor('#12212f')
BLUE = colors.HexColor('#0b56b0')
GREY = colors.HexColor('#556072')
RULE = colors.HexColor('#c9d4e0')
TINT = colors.HexColor('#eef3f9')

PW, PH = A4
LM, RM, TM, BM = 38.0, 38.0, 28.0, 26.0
FW = PW - LM - RM

def st(name, **kw):
    base = dict(fontName='Helvetica', fontSize=9.0, leading=12.2, textColor=INK)
    base.update(kw)
    return ParagraphStyle(name, **base)

S = {
    'name': st('name', fontName='Helvetica-Bold', fontSize=20, leading=22, spaceAfter=3),
    'role': st('role', fontSize=11, leading=13.5, textColor=BLUE, spaceAfter=3),
    'contact': st('contact', fontSize=8.5, leading=11.5, textColor=GREY),
    'sec': st('sec', fontName='Helvetica-Bold', fontSize=10.2, leading=12.4, textColor=BLUE,
              spaceBefore=6.6, spaceAfter=1.2),
    'body': st('body', fontSize=9.2, leading=12.3),
    'bul': st('bul', fontSize=9.0, leading=11.6, leftIndent=9, firstLineIndent=-7, spaceAfter=1.2),
    'jt': st('jt', fontName='Helvetica-Bold', fontSize=9.8, leading=12),
    'jd': st('jd', fontSize=8.6, leading=12, textColor=GREY, alignment=TA_RIGHT),
    'ctx': st('ctx', fontSize=8.5, leading=11.4, textColor=GREY, spaceAfter=1.5),
    'kpi_n': st('kpi_n', fontName='Helvetica-Bold', fontSize=15, leading=17, textColor=BLUE,
                alignment=TA_CENTER),
    'kpi_t': st('kpi_t', fontSize=8.0, leading=9.8, textColor=INK, alignment=TA_CENTER),
    'line': st('line', fontSize=8.9, leading=11.7, spaceAfter=0.3),
}

def rule(w=0.5, sb=0.0, sa=2.5):
    return HRFlowable(width=FW, thickness=w, color=RULE, spaceBefore=sb, spaceAfter=sa)

def section(F, title):
    F.append(Paragraph(title, S['sec']))
    F.append(rule())

def two_col(left, right, ls, rs, split=0.74):
    t = Table([[Paragraph(left, ls), Paragraph(right, rs)]], colWidths=[FW * split, FW * (1 - split)])
    t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
                           ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                           ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0)]))
    return t

def job(F, j):
    head = [Spacer(1, 3.5),
            two_col(j['role'], j['date'], S['jt'], S['jd']),
            Paragraph('<font color="#12212f"><b>%s</b></font> · %s' % (j['company'], j['ctx']), S['ctx']),
            Paragraph('• ' + j['bullets'][0], S['bul'])]
    F.append(KeepTogether(head))
    for b in j['bullets'][1:]:
        F.append(Paragraph('• ' + b, S['bul']))

def kpis(F, items):
    cells = [[Paragraph(n, S['kpi_n']) for n, _ in items], [Paragraph(t, S['kpi_t']) for _, t in items]]
    t = Table(cells, colWidths=[FW / len(items)] * len(items))
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), TINT),
                           ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                           ('TOPPADDING', (0, 0), (-1, 0), 6), ('BOTTOMPADDING', (0, 1), (-1, 1), 6),
                           ('TOPPADDING', (0, 1), (-1, 1), 1), ('BOTTOMPADDING', (0, 0), (-1, 0), 0),
                           ('LINEAFTER', (0, 0), (-2, -1), 0.6, colors.white)]))
    F.append(Spacer(1, 5))
    F.append(t)

CONTACT = ('rolanddzoagbe@gmail.com · +33 7 82 88 46 46 · Bondy (Île-de-France) · '
           'linkedin.com/in/r-dz · rdzoagbe.github.io/Portfolio.RDzoagbe')

C = {
'fr': dict(
    role='Responsable IT &amp; Infrastructure (IT Manager) · Microsoft 365, identités et sécurité',
    s_sum='PROFIL', s_exp='EXPÉRIENCE', s_proj='PROJETS EN COURS', s_prev='PARCOURS ANTÉRIEUR',
    s_comp='COMPÉTENCES', s_edu='FORMATION, CERTIFICATIONS ET LANGUES',
    summary='Responsable IT et infrastructure, 7 ans en informatique dont 3 à la tête de l’IT '
            'd’organisations internationales : Host Broadcast Services, Jeux Olympiques de Paris 2024, '
            'Zenly (groupe Snap), AKUR8. Spécialiste Microsoft 365, Intune, Entra ID et Okta. '
            'Bilingue français/anglais. Disponible immédiatement pour un CDI en Île-de-France.',
    kpis=[('-80 %', 'temps de résolution<br/>des incidents (HBS)'),
          ('600+', 'utilisateurs, 5 sites,<br/>production 24/7'),
          ('250+', 'utilisateurs aux Jeux<br/>de Paris 2024'),
          ('-15 %', 'coûts de licences SaaS<br/>(Zenly)')],
    jobs=[
        dict(role='Responsable Infrastructure &amp; Support', date='Mars 2025 – Déc. 2025',
             company='Host Broadcast Services (HBS)',
             ctx='Production et diffusion sportive internationale · 600+ utilisateurs, 5 sites · 24/7',
             bullets=['Direction d’une équipe support N1–N3 de 6 personnes (France, États-Unis) ; refonte des '
                      'incidents et des changements dans ServiceNow : <b>temps de résolution réduit de 80 %</b>.',
                      'Sécurité : scripts PowerShell reliés à Defender (blocage automatique d’un compte compromis, '
                      '<b>incident contenu en 45 min</b>), droits d’administration temporaires suivis via Intune, '
                      'contribution au déploiement de la MFA et de l’accès conditionnel.',
                      'Autopilot et Intune : <b>préparation des postes 30 % plus rapide</b> ; modernisation réseau et '
                      'serveurs ; tableaux de bord direction.']),
        dict(role='Responsable IT – Jeux Olympiques et Paralympiques de Paris 2024', date='Mars 2024 – Mars 2025',
             company='The iLUKA Collective', ctx='CDD pour les Jeux, puis mission au Royaume-Uni · 250+ utilisateurs',
             bullets=['<b>Point de contact IT unique</b> de tous les départements : conception et exploitation de '
                      'l’infrastructure des sites (connectivité, postes, téléphonie, matériel de secours).',
                      'Administrateur Microsoft 365 : droits par rôle, accès des externes, traçabilité RGPD, conformité '
                      'des postes avec Defender.',
                      'Pilotage de <b>5 fournisseurs</b> (Microsoft, matériel, impression, réseau, achats Amazon) et des SLA ; suivi du '
                      'budget IT avec la direction ; billetterie, CRM et contrôle d’accès ; clôture du projet.',
                      'Après les Jeux (oct. 2024 – mars 2025) : <b>retour de l’IT en interne</b>, au siège de '
                      'l’entreprise au Royaume-Uni.']),
        dict(role='Corporate IT Lead', date='Mai 2023 – Oct. 2023',
             company='AKUR8', ctx='Éditeur SaaS pour l’assurance · 50+ utilisateurs internationaux',
             bullets=['Gestion des identités et des accès (Okta, Google Workspace) : comptes, droits, arrivées et '
                      'départs, dans le respect du RGPD.',
                      'Budget IT, achats et fournisseurs ; escalades et mises à jour selon ITIL.']),
        dict(role='Responsable IT', date='Juil. 2022 – Mars 2023',
             company='Zenly (groupe Snap Inc.)', ctx='Scale-up · 180+ utilisateurs internationaux · fin : fermeture du bureau parisien de Snap',
             bullets=['<b>Réduction de 15 % des coûts de licences SaaS</b> grâce à des audits d’accès.',
                      'Okta et Google Workspace ; parc Windows, macOS et Linux (Jamf) ; PRA et fermeture du bureau.']),
    ],
    projects=['<b>StackLens</b> (stacklens.fr), depuis janv. 2026 : audit des abonnements SaaS des PME et de leurs '
              'experts-comptables (doublons, renouvellements, accès des anciens collaborateurs).',
              '<b>Ahenora</b> (ahenora.com) : application d’organisation familiale publiée sur l’App Store, '
              'Google Play et le web.'],
    older=[('<b>Analyste support technique</b> \u00b7 Dechert LLP, cabinet international \u00b7 SLA respectés à plus de 99 %', 'Juin 2021 \u2013 Juil. 2022'),
           ('<b>Technicien support</b> \u00b7 The American University of Paris \u00b7 support N1/N2, parc Mac et mobile', 'Avr. 2021 \u2013 Mai 2021'),
           ('<b>Technicien support N2/N3</b> \u00b7 Artemys \u00b7 Microsoft 365, migration Windows 10, réseau Cisco', 'Avr. 2020 \u2013 Avr. 2021'),
           ('<b>Support N1/N2</b> \u00b7 Cabinet Alain Bensoussan Avocats \u00b7 premier poste en informatique', 'Févr. 2019 \u2013 Avr. 2020'),
           ('<b>Aide-soignant</b> \u00b7 établissements de santé, puis reconversion vers l\u2019informatique', '2009 \u2013 2017')],
    now=dict(role='Fondateur \u2013 StackLens', date='Janv. 2026 \u2013 Aujourd\u2019hui',
             company='Activité indépendante', ctx='en parallèle de ma recherche de CDI',
             bullets=['<b>StackLens</b> (stacklens.fr) : audit des abonnements SaaS des PME et de leurs experts-comptables '
                      '(doublons, renouvellements, accès des anciens collaborateurs).',
                      '<b>Ahenora</b> (ahenora.com) : application d\u2019organisation familiale publiée sur l\u2019App Store, '
                      'Google Play et le web.']),
    prev=['<b>Dechert LLP</b> – Analyste support technique, cabinet international, plus de 99 % de respect des SLA '
          '<font color="#556072">(2021–2022)</font>',
          '<b>Artemys</b> – Technicien support N2/N3, Microsoft 365, migration Windows 10 '
          '<font color="#556072">(2020–2021)</font> · <b>American University of Paris</b> – Technicien '
          'support <font color="#556072">(2021)</font>',
          '<b>Cabinet Alain Bensoussan Avocats</b> – Support N1/N2, premier poste en informatique '
          '<font color="#556072">(2019–2020)</font>',
          'Aide-soignant en établissements de santé, puis reconversion vers l’informatique '
          '<font color="#556072">(2009–2017)</font>'],
    comps=[('Identités et sécurité', 'Entra ID (MFA, accès conditionnel, PIM), Active Directory, Okta, Defender, cybersécurité, RGPD, PCA/PRA'),
           ('Postes et infrastructure', 'Microsoft 365, gestion de parc et MDM (Intune, Autopilot, Jamf), Windows Server, Azure, Meraki, Veeam, PowerShell'),
           ('Services et management', 'ITIL, ServiceNow, helpdesk N1–N3, SLA et indicateurs, management d’équipe, prestataires, budget')],
    edu=['<b>VAE en cours</b> : titre CESI Manager en infrastructures et cybersécurité des SI (RNCP niveau 7, Bac+5)',
         'ITIL 4 Foundation (examen à venir) · Azure AZ-104 (Alison, 2026) · Cybersécurité : Google (2024), Cisco (2023)',
         '3W Academy, développement (2017) · <b>Langues</b> : français et anglais (bilingue)'],
),
'en': dict(
    role='IT &amp; Infrastructure Manager · Microsoft 365, identity and security',
    s_sum='PROFILE', s_exp='EXPERIENCE', s_proj='CURRENT PROJECTS', s_prev='EARLIER CAREER',
    s_comp='SKILLS', s_edu='EDUCATION, CERTIFICATIONS AND LANGUAGES',
    summary='IT and infrastructure manager with 7 years in IT, including 3 running IT for international '
            'organisations: Host Broadcast Services, the Paris 2024 Olympic Games, Zenly (Snap Inc.) and AKUR8. '
            'Specialist in Microsoft 365, Intune, Entra ID and Okta. Bilingual French/English. '
            'Available immediately for a permanent role in the Paris area.',
    kpis=[('-80%', 'incident resolution<br/>time (HBS)'),
          ('600+', 'users, 5 sites,<br/>24/7 production'),
          ('250+', 'users at the Paris<br/>2024 Games'),
          ('-15%', 'SaaS licence costs<br/>(Zenly)')],
    jobs=[
        dict(role='Infrastructure &amp; Support Manager', date='Mar 2025 – Dec 2025',
             company='Host Broadcast Services (HBS)',
             ctx='International sports broadcasting · 600+ users, 5 sites · 24/7',
             bullets=['Led a 6-person L1–L3 support team (France, US); rebuilt incident and change management in '
                      'ServiceNow: <b>80% faster incident resolution</b>.',
                      'Security: PowerShell scripts linked to Defender (automatic blocking of a compromised account, '
                      '<b>incident contained in 45 min</b>), time-limited admin rights tracked through Intune, '
                      'contribution to the MFA and Conditional Access rollout.',
                      'Autopilot and Intune: <b>30% faster device provisioning</b>; network and server upgrades; '
                      'dashboards for management.']),
        dict(role='IT Manager – Paris 2024 Olympic and Paralympic Games', date='Mar 2024 – Mar 2025',
             company='The iLUKA Collective', ctx='Fixed-term contract for the Games, then an assignment in the UK · 250+ users',
             bullets=['<b>Single IT point of contact</b> for every department: designed and ran the site infrastructure '
                      '(connectivity, devices, phones, spare equipment).',
                      'Microsoft 365 administrator: role-based access, external users, GDPR traceability, device '
                      'compliance with Defender.',
                      'Managed <b>5 suppliers</b> (Microsoft, hardware, printing, networking, Amazon purchasing) and their SLAs; tracked the '
                      'IT budget with management; Eventim ticketing, CRM and access control; project close-out.',
                      'After the Games (Oct 2024 – Mar 2025): <b>brought IT back in-house</b> at the company’s '
                      'UK head office.']),
        dict(role='Corporate IT Lead', date='May 2023 – Oct 2023',
             company='AKUR8', ctx='Insurance SaaS vendor · 50+ international users',
             bullets=['Identity and access management (Okta, Google Workspace): accounts, rights, joiners and leavers, '
                      'GDPR-compliant.',
                      'IT budget, purchasing and vendors; escalations and updates following ITIL.']),
        dict(role='IT Manager', date='Jul 2022 – Mar 2023',
             company='Zenly (Snap Inc.)', ctx='Scale-up · 180+ international users · role ended when Snap closed its Paris office',
             bullets=['<b>Cut SaaS licence costs by 15%</b> through access audits.',
                      'Okta and Google Workspace; Windows, macOS and Linux fleet (Jamf); DRP and office closure.']),
    ],
    projects=['<b>StackLens</b> (stacklens.fr), since Jan 2026: SaaS subscription audits for SMBs and their '
              'accountants (duplicates, renewals, former employees who still have access).',
              '<b>Ahenora</b> (ahenora.com): family organisation app published on the App Store, Google Play and the web.'],
    older=[('<b>Technical Support Analyst</b> \u00b7 Dechert LLP, international law firm \u00b7 99%+ SLA compliance', 'Jun 2021 \u2013 Jul 2022'),
           ('<b>Support Technician</b> \u00b7 The American University of Paris \u00b7 L1/L2 support, Mac and mobile fleet', 'Apr 2021 \u2013 May 2021'),
           ('<b>L2/L3 Support Technician</b> \u00b7 Artemys \u00b7 Microsoft 365, Windows 10 migration, Cisco network', 'Apr 2020 \u2013 Apr 2021'),
           ('<b>L1/L2 Support</b> \u00b7 Alain Bensoussan Avocats \u00b7 first IT role', 'Feb 2019 \u2013 Apr 2020'),
           ('<b>Healthcare assistant</b> \u00b7 hospitals and care facilities, then a career change into IT', '2009 \u2013 2017')],
    now=dict(role='Founder \u2013 StackLens', date='Jan 2026 \u2013 Present',
             company='Self-employed', ctx='alongside my search for a permanent role',
             bullets=['<b>StackLens</b> (stacklens.fr): SaaS subscription audits for SMBs and their accountants '
                      '(duplicates, renewals, former employees who still have access).',
                      '<b>Ahenora</b> (ahenora.com): family organisation app published on the App Store, Google Play and the web.']),
    prev=['<b>Dechert LLP</b> – Technical Support Analyst, international law firm, 99%+ SLA compliance '
          '<font color="#556072">(2021–2022)</font>',
          '<b>Artemys</b> – L2/L3 Support Technician, Microsoft 365, Windows 10 migration '
          '<font color="#556072">(2020–2021)</font> · <b>American University of Paris</b> – Support '
          'Technician <font color="#556072">(2021)</font>',
          '<b>Alain Bensoussan Avocats</b> – L1/L2 Support, first IT role <font color="#556072">(2019–2020)</font>',
          'Healthcare assistant in hospitals and care facilities, then a career change into IT '
          '<font color="#556072">(2009–2017)</font>'],
    comps=[('Identity and security', 'Entra ID (MFA, Conditional Access, PIM), Active Directory, Okta, Microsoft Defender, cybersecurity, GDPR, BCP/DRP'),
           ('Devices and infrastructure', 'Microsoft 365, device management and MDM (Intune, Autopilot, Jamf), Windows Server, Azure, Meraki, Veeam, PowerShell'),
           ('Service and management', 'ITIL, ServiceNow, L1–L3 service desk, SLAs and KPIs, team management, vendors, budget')],
    edu=['<b>In progress (VAE)</b>: CESI Manager en infrastructures et cybersécurité des SI (EQF level 7, Master’s level)',
         'ITIL 4 Foundation (exam pending) · Azure AZ-104 (Alison, 2026) · Cybersecurity: Google (2024), Cisco (2023)',
         '3W Academy, software development (2017) · <b>Languages</b>: French and English (bilingual)'],
),
}

def build(lang, path):
    c = C[lang]
    F = [Paragraph('ROLAND DZOAGBE', S['name']), Paragraph(c['role'], S['role']),
         Paragraph(CONTACT, S['contact']), rule(0.8, sb=5, sa=0)]
    section(F, c['s_sum'])
    F.append(Paragraph(c['summary'], S['body']))
    kpis(F, c['kpis'])
    section(F, c['s_exp'])
    job(F, c['now'])
    for j in c['jobs']:
        job(F, j)
    F.append(Spacer(1, 4))
    for left, right in c['older']:
        F.append(two_col(left, right, S['line'], S['jd'], split=0.80))
        F.append(Spacer(1, 1.5))
    section(F, c['s_comp'])
    for lab, txt in c['comps']:
        F.append(Paragraph('<b>%s</b> : %s' % (lab, txt) if lang == 'fr' else '<b>%s</b>: %s' % (lab, txt), S['line']))
    section(F, c['s_edu'])
    for e in c['edu']:
        F.append(Paragraph(e, S['line']))
    doc = BaseDocTemplate(path, pagesize=A4, leftMargin=LM, rightMargin=RM, topMargin=TM, bottomMargin=BM,
                          title='Roland Dzoagbe — CV', author='Roland Dzoagbe')
    doc.addPageTemplates([PageTemplate(id='p', frames=[Frame(LM, BM, FW, PH - TM - BM, 0, 0, 0, 0)])])
    doc.build(F)
    print('built', path)

if __name__ == '__main__':
    build('fr', os.path.join(OUT, 'Roland_Dzoagbe_FR.pdf'))
    build('en', os.path.join(OUT, 'Roland_Dzoagbe_EN.pdf'))
