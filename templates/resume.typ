// Harvard-Style Resume Template in Typst
// Sovereign Desk — Mathematical Typographical Precision Engine

#let profile-path = sys.inputs.at("profile", default: "/profile.yaml")
#let data = yaml(profile-path)

#set page(
  paper: "us-letter",
  margin: (x: 0.45in, top: 0.38in, bottom: 0.38in),
)

#set text(
  font: ("New Computer Modern", "Times New Roman", "Georgia"),
  size: 8.8pt,
  fill: rgb("#111827"),
  spacing: 100%,
  lang: "en",
)

#set par(
  leading: 0.35em,
  justify: true,
)

// Section Heading Helper
#let section(title) = {
  v(0.3em)
  text(weight: "bold", size: 9.8pt, tracking: 0.05em)[#upper(title)]
  v(-0.45em)
  line(length: 100%, stroke: 0.5pt + rgb("#374151"))
  v(0.18em)
}

// Experience Item Helper
#let exp-entry(company, role, location, start-date, end-date, highlights) = {
  block(width: 100%, breakable: false)[
    #grid(
      columns: (1fr, auto),
      align: (left, right),
      [#text(weight: "bold", size: 9.2pt)[#company]],
      [#text(weight: "medium", size: 8.5pt, fill: rgb("#374151"))[#start-date -- #end-date]],
    )
    #v(-0.42em)
    #grid(
      columns: (1fr, auto),
      align: (left, right),
      [#text(style: "italic", size: 8.7pt)[#role]],
      [#text(size: 8.2pt, fill: rgb("#4b5563"))[#location]],
    )
    #v(-0.35em)
    #list(
      marker: [•],
      tight: true,
      spacing: 0.22em,
      ..highlights.map(h => [
        #text(size: 8.6pt)[#h]
      ])
    )
  ]
  v(0.08em)
}

// -------------------------------------------------------------------------
// HEADER
// -------------------------------------------------------------------------
#align(center)[
  #text(weight: "bold", size: 16pt, tracking: 0.02em)[#data.basics.name] \
  #v(-0.48em)
  #text(size: 9pt, weight: "medium", fill: rgb("#1f2937"))[#data.basics.label] \
  #v(-0.38em)
  #text(size: 8.2pt, fill: rgb("#4b5563"))[
    #data.basics.location
    #text(fill: rgb("#9ca3af"))[ | ]
    #data.basics.phone
    #text(fill: rgb("#9ca3af"))[ | ]
    #link("mailto:" + data.basics.email)[#data.basics.email]
    #text(fill: rgb("#9ca3af"))[ | ]
    #link(data.basics.website)[#data.basics.website.replace("https://", "")]
    #text(fill: rgb("#9ca3af"))[ | ]
    #link(data.basics.github)[#data.basics.github.replace("https://", "")]
    #text(fill: rgb("#9ca3af"))[ | ]
    #link(data.basics.linkedin)[#data.basics.linkedin.replace("https://", "")]
  ]
]

#v(-0.4em)

// -------------------------------------------------------------------------
// PROFESSIONAL EXPERIENCE
// -------------------------------------------------------------------------
#section("Professional Experience")

#for job in data.experience [
  #exp-entry(
    job.company,
    job.role,
    job.location,
    job.start_date,
    job.end_date,
    job.highlights,
  )
]

// -------------------------------------------------------------------------
// TECHNICAL SKILLS
// -------------------------------------------------------------------------
#section("Technical Skills")

#block(width: 100%, breakable: false)[
  #grid(
    columns: (auto, 1fr),
    column-gutter: 0.5em,
    row-gutter: 0.22em,
    [#text(weight: "bold", size: 8.5pt)[Languages:]],
    [#text(size: 8.5pt)[#data.skills.languages.join(", ")]],
    [#text(weight: "bold", size: 8.5pt)[Distributed Systems:]],
    [#text(size: 8.5pt)[#data.skills.distributed_systems.join(", ")]],
    [#text(weight: "bold", size: 8.5pt)[AI & ML Platform:]],
    [#text(size: 8.5pt)[#data.skills.ai_infrastructure.join(", ")]],
    [#text(weight: "bold", size: 8.5pt)[Cloud & Platforms:]],
    [#text(size: 8.5pt)[#data.skills.cloud_and_platform.join(", ")]],
  )
]

// -------------------------------------------------------------------------
// EDUCATION
// -------------------------------------------------------------------------
#section("Education")

#for edu in data.education [
  #block(width: 100%, breakable: false)[
    #grid(
      columns: (1fr, auto),
      align: (left, right),
      [#text(weight: "bold", size: 8.8pt)[#edu.institution]],
      [#text(size: 8.4pt, fill: rgb("#374151"))[#edu.graduation_year]],
    )
    #v(-0.4em)
    #grid(
      columns: (1fr, auto),
      align: (left, right),
      [#text(style: "italic", size: 8.5pt)[#edu.degree]],
      [#text(size: 8.2pt, fill: rgb("#4b5563"))[#edu.location]],
    )
    #if "details" in edu [
      #v(-0.35em)
      #text(size: 8.2pt, fill: rgb("#374151"))[#edu.details]
    ]
  ]
]

// -------------------------------------------------------------------------
// OPEN SOURCE & PUBLICATIONS
// -------------------------------------------------------------------------
#if "open_source_and_publications" in data [
  #section("Open Source & Publications")
  #for item in data.open_source_and_publications [
    #block(width: 100%, breakable: false)[
      #text(weight: "bold", size: 8.5pt)[
        #if "link" in item [
          #link(item.link)[#item.title]
        ] else [
          #item.title
        ]
      ]
      #text(fill: rgb("#4b5563"), size: 8.5pt)[ -- #item.description]
    ]
    #v(0.05em)
  ]
]
