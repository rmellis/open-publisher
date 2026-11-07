/**
 * OpenPublisher Professional Proofing & Grammar Engine (v5.19.0)
 * Comprehensive offline spellcheck and online grammar proofing using modern CSS Custom Highlight API.
 * Powered by OpenPublisher's comprehensive 280,000+ word offline dictionary (SCOWL + ENABLE1 + DTP)
 * with instant O(1) text-node token scanning and intelligent local phonetic/Levenshtein suggestion engine.
 * Renders:
 *  - Crisp RED wavy underlines for spelling mistakes (::highlight(spelling-error))
 *  - Crisp GREEN wavy underlines for grammar, duplication, casing, and style mistakes (::highlight(grammar-error))
 * Across all zoom levels with continuous descender coverage (text-decoration-skip-ink: none)
 * without mutating DOM text nodes or suffering offset drift.
 */

(function initProofingEngine() {
    'use strict';

    const _customDictSet = new Set();
    const _ignoredWordsSet = new Set();
    const _ignoredRulesSet = new Set();
    const _knownBadWords = new Set();
    const _knownGoodWords = new Set();
    const _builtinGoodWords = "a aaa aaas aaron aarons abbotsford abercrombie aberdare aberdeen aberdeenshire aberford abhyanga abhyangas abigail abigails abudhabi abuja ac aca acas accra accrington ackworth acls acomb acs adam adams addingham adel adelaide adipiscing adipiscings adm admiral admirals adms adrian adrians adv advent advents advocate advocates advs adwick aeg aegean aegeans africa agentic agentics agua aguas aiden aidens airbnb airdrie airedale akron alabama alan alans alaska albania albert alberta alberts albertsons albuquerque albury alc alcs alderman aldermanship aldermen aldi aldis alex alexander alexanders alexchen alexchens alexrivera alexriveras alexs algiers aliqua aliquas aliquip aliquips alistair alistairs alla allas alle allerton alles alloa alnwick alphalete altrincham alvarez alvarezs alwoodley amalfi amalfis amann amanns amaro amaros amazon amelia amelias american americano americanos americans americas amet amets amir amirs amman amsterdam anaheim anc anchorage ancs anderson andersons andrew andrews angel angeles angels anglesey angus anim anims ankara anlaby anston antarctica anthony anthonys antoine antoines anton antons antrim ap apac apacs apendleton apendletons aperitivo aperitivos aperol aperols apexathlete apexathletes apexglobal apexglobals apexmedical apexmedicals apexscholars apexstadium apexstadiums apexstrategy apexstrategys apexventures api apis apple applewood applewoods apr april aprils aprs aps aquafaba aquafabas arancini arancinis arbroath archbishop archbishops archdeacon archdeacons arcu arcus ardsley argos argyll aria arias arizona arkansas arlington arlo arlos armagh armani armenia armley armthorpe arr arrs arthur arthurs asada asadas asadors ascender ascenders asda asdas asher ashers ashford ashington ashton asia askern asos aston astor astorcelebrations astoria astorianye astorianyes astorias astors asuncion async asyncs atelierlumiere atelierlumieres athens athlone atlanta atlantic atlantics attorney attorneys atty attys au auchan auckland audrey audreys aug aughton augs august augusts auraboutique auraboutiques auradesign auradesigns aurora auroras aus austin austins austria aute autentica autenticas autes auth auths autocad autocads autocorrect ava avas avatars avenure avenures avery averys avg avgs aws axel axels ayatollah ayatollahs ayr ayrshire az azerbaijan azimut azimuts azs azurecliffsresort azurecliffsresorts azureyachts babysboutique babysboutiques badsworth baffin baffins baghdad baildon bakersfield baku balbriggan balby balenciaga bali balis ballarat ballyclare ballymena ballymoney baltimore banbridge banffshire bangalore bangkok bangor banh banhs barbara barbaras barbour barcelona barcelonas bardsey barlby barnsley baron baroness baronesses barons barrie barrister barristers barrow barry bartlett bartletts barughgreen barwick basildon basingstoke batemoor bath bathgate batley batonrouge bauhaus baumann baumanns bawtry bbq bbqs bc bcs bearsden beau beaus bebas beckett becketts bedale bedford bedfordshire beeston behance behances beighton beijing beirut beko belarus belfast belgian belgians belgium belgrade bella bellas belleisle bellini bellinis bendigo benjamin benjamins bennett bennetts bentley berber berbers berkshire berlin bern bershka berwick berwickshire bessacarr beverley beverly beverlys bianche bianches biannual biannually biannuallys biannuals bicentennial bicentennials bigquery bigquerys billingham billings billy billys bimonthly bimonthlys bingley biohacking biohackings birkenhead birmingham birria birrias birstall bishop bishops bishopthorpe bitcoin biweekly biweeklys blackburn blackpool blaenaugwent blake blakes blanc blancs bleu bleus blitzen blitzens blvd blvds blyth bobby bobbys bodmin bodyshop bogota boise bolton boohoo booker booths bootle boots bosch bosco boscos bose bosnia boston bostonspa bottura botturas boucl boucls bournemouth br bradford bradley bradleys bramham bramhope bramley brandon brandons brasilia bratislava bray brayton bre breathwork breathworks breitling brentwood bres bretton brian brians bridgend bridlington brierley brigadier brigadiers brighouse brighton brightsmile brightsmiles brinsworth brisbane bristol britishcolumbia bronte brontes brooklyn brooklyns brooks broome broomes broomhill brotherton brough brown browns bruce bruces brussels bryan bryans bsn bsns bucharest buckinghamshire budapest budgens buenosaires buffalo bugfix bugfixes bulgaria bunbury bundaberg bunnings burberry burgerking burley burmantofts burngreave burnley burrata burratas burton bury bute buttershaw byram bywater ca cac cachebuster cachebusters cacio cacios cacs cadet cadets caerphilly caf caffe cafs cairns cairo caithness calabrian calabrians calacatta calacattas caleb calebs calgary california calvin calvinklein calvins cambridge cambridgeshire cambuslang cameron camerons camila camilas camille camilles campari camparis campbell campbells camppinecrest camppinecrests canberra candy cannes cannock canon canons canterbury cantley capetown capricciosa capricciosas capt captain captains capts caracas carcroft cardiff cardinal cardinals carl carlisle carlow carls carlton carmarthen carmarthenshire carne carnes carolers carolina carolinas caroling carolings carpathian carpathians carrefour carrickfergus carson carsons carter carters cartier cas casablanca casaterra casaterras cascadia cascadiaconservancy cascadiaconservancys cascadias cashback casio castillo castillos castleford castlereagh castore catcliffe cateringprivate cateringprivates catterick cavatappi cavatappis cawood cc ccrn ccrns ccs ceo ceos ceredigion cet cets ceylon ceylons chambershale chambershales championscamp championscamps chancellor chancellors chandler chanel chanukah chanukahs chapelallerton chapeltown chaplain chaplains charles charleston charlotte charlottes chatham chavez chavezs chebbi chebbis chelmsford chelsea chelseas cheltenham chemex chemexs chemistwarehouse chen chennai chens cherrywood cherrywoods chesapeake cheshire chester chiat chiats chicago chief chiefs chilean chileans chinatown chinatowns chisinau chloe chloes chocolat chocolats chorley christchurch christian christians christmas christmases christmastime christmastimes christopher christophers chulavista churwell cillum cillums cincinnati cinzel cinzels citizen citybookfair citybookfairs clackmannanshire claire claires clapham clara claras clark clarks classof classofs claus clayton claytonwest cleckheaton cleveland cliffe cliffside cliffsides clipart cllr cllrs clo clos cloudbase cloudbases cloudflare cloudflares cloudnet cloudnets clwyd clydebank cmdr cmdrs cmf cmfs cmo cmos cmyk cnc cncs co coatbridge coffsharbour col colchester cole coleraine coles colin colins collingham colombia colombias colombo colonel colonels colorado coloradosprings cols colton coltons columbia columbias columbus colwynbay com comber comet commander commanders commodo commodore commodores commodos coms congleton congressman congressmen congresswoman congresswomen conisbrough connecticut consectetur consecteturs consequat consequats consomm consomms const constable constables consts contactless converse conwy cookridge cookstown coop cooper coopers copenhagen copmanthorpe corby cork cornell cornells cornwall corp corporal corporals corps corpuschristi cortado cortados cos costa costco costcos costcutter costcutters cottingham cotto cottos councillor councillors counsel counsels count countess countesses counts coventry cpa cpas cpl cpls craigavon cramlington crawley creativestudio creativestudios creatorgear creatorgears crema cremas crewclothing crewe crigglestone crm crms croatia crofton crookes croque croques crosby crosbys crossflatts crossgates crosshills cryo cryos crypto cryptos csm csms css3 cto ctos ctr ctrl ctrls ctrs cuda cudas cudworth cullingworth culpa culpas cum cumbernauld cumbria cums cupidatat cupidatats curate curates currys cv cvs cwmbran cybersecurity cycladic cycladics cyprus czechia daiginjo daiginjos dallas damascus dame dames dancer dancers daniel daniels darkmode darlington darnall dartford darton darwin dasher dashers datacorp datacorps datasets datatech datatechs david davids davis dc dcs dds deacon deaconess deaconesses deacons deal dean deans dearne debenhams dec decathlon december decembers declan declans decs deepcar delaware delhaize delhi deliverables deliveroo deloitte deloittes delonghi denbighshire denbydale denholme denmark dennis denver depop deputies deputy derby derbyshire derek dereks derry descender descenders deserunt deserunts desmoines det detective detectives detroit dets devcon devconhorizon devconhorizons devcons devmail devmails devon devops dewalt dewalts dewsbury dexa dexas dfm dfms dhaka dialogs diavola diavolas diaz diazs dinnington dior diplome diplomes dir dirs discord diwali diwalis dixons dj dji djs doc docent docents docmartens docs dodworth doha doja dojas dolla dollas dolor dolore dolores dolors dom dominic dominics dominos don dona donaghadee doncaster doorbuster doorbusters dore dorset douglas dover down downpatrick dpi dr dreidel dreidels dremel dremels dri driffield dris drogheda dropcap dropcaps dropdowns drs drsarahchen drsarahchens drumlines du dua duas dubai dubbo dublin duchess duchesses duis duke dukes dumbarton dumfries dumfriesshire dunbartonshire dundalk dundee dunedin dunelm dungannon dunnington dunscroft durban durham dus dyfed dylan dylans dyson eagle earl earls earthocean earthoceans easington eastbourne eastburn easter easters eastex eastkilbride easton eastons eastriding ebay ebitda ebitdas eccles ecclesfield eccleshill ecmo ecmos edeka edinburgh edlington edmonton edtech edu edus edward edwards ehr ehrs eid eids eiusmod eiusmods elder elders eleanor eleanors eleiko eleikos elena elenarossi elenarossis elenarostova elenarostovas elenas elevatefitness elf elfs elgin eli elias elijah elijahs eliot eliots elis elit elits elizabeth elizabeths ella elland ellas ellesmereport ellie ellies elliott elliotts elpaso elves elysee elysees emea emeas emilia emilian emiliana emilianas emiliano emilianos emilians emilias emily emilys emley emma emmas emojis england enim enims ennis enniskillen enzo enzos epubs equinox equinoxes equinoxs erat erats eric erics erostova erostovas erp erps ertificate ertificates espadin espadins esports esq esqs esquire esquires essex estonia ethan ethans ethereum ethiopia ethiopias etsy eu eugene eugenes euler europe european europeans eus evelyn evelyns everett everetts excellencies excellency excepteur excepteurs executiveboard executiveboards exercitation exercitations exeter exup exups ezra ezras facs fagd fagds fairburn falkirk falmouth farmfoods farnley farsley fatface father fathers featherstone feb february februarys febs felix felixs fellow fellows fendi fenwick fermanagh ferris ferrybridge fi fifeshire figma figmas filey fillmore fillmores filmfest filmfests finland finn finningley finns fintech fiona fionas fior fiors fira firas firvale fis fitzwilliam fl fleur fleurs flintshire flockton flores florida fls folkestone fontfamily footasylum footlocker forma formaggi formaggis formas formastudio formastudios forno fornos fortnum fortnums fortwayne fortwilliam fortworth fr france frances francescana francescanas francisco franciscos francois frank franks frau frauen fraulein fred fredoka fredokas freds fremont fresca frescas fresno fri friday fridays fris frontend frontends frs ft fts fuego fuegos fuegostreettacos fuegotacotruck fuegotacotrucks fugiat fugiats fujifilm fulford fullbleed fullstack fulwood funghi funghis futuresystems fylde gabriel gabriels gael gaels gaeta gaetas gaggenau gaggenaus galentine galentines galerie galeries gallo gallos galway gant garamond garamonds garcia garcias garde gardes garforth garland garrowby gateshead gatsby gatsbys gc gcs gdp gdps ge geelong gen general generals gens georgia gerald geralds germany ges ghd giant gifs gilbert gillingham gingerbread gingerbreads ginza ginzas giovanni giovannis gipton gisborne github githubs gladstone glamorgan glasgow glasshoughton gleadless glendale glenrothes gloria glorias gloucester gloucestershire glsl glsls goldcoast goldthorpe gomez gomezs gonzalez gonzalezs googleapis googlefonts goole gorgonzola gorgonzolas gou gouda goudas gous governor governors gpa gpas gpus grace graces graham grahams grandempress grandrapids grangemouth grant grants gravesend grays grayson graysons greatermanchester greece greenock greensboro greggs gregory gregorys greyson greysons grimethorpe grotesk grotesks gshock gt gtm gtms gts gua guam guas gucci guildford guiseley guru gurus gutierrez gutierrezs gwent gwynedd gymshark haccp haccps hackathon hackathons hadid hadids hadoop hadoops halfords halifax halloween halloweens hallowsball hallowsballs halton hamilton hamleys hampshire handsworth hannah hannahs hanoi hans hanukkah hanukkahs happypawssalon happypawssalons harborfront harborfronts harborview harborviews hardden harehills harewood harlow harold harolds harper harpers harrington harringtons harringtonvance harringtonvances harris harrison harrisons harrods harrogate harthill hartlepool harvard harvards harveynichols hashtag hashtags hastings hatfield havercroft haverfordwest hawaii hawes hawksworth haworth hayden haydens hayes hazel hazels hd hdr hdrs hds headingley headmaster headmasters headmistress headmistresses headteacher headteachers hebburn hebdenbridge hebrides heckmondwike hedon heeley helen helens helmsley helsinki helvetica helveticas hemelhempstead hemingbrough hemsworth henderson hendrerit hendrerits henrik henriks henry henrys hepa hepas hereford herefordshire hernandez hernandezs herr herren hertfordshire herveybay herzegovina hessle heworth hexcode hexham highlands highness highnesses hiit hiits hillsborough himalayan himalayans hinckley hm hmart hobart hogmanay hogmanays hojicha hojichas hokkaido hokkaidos holbeck holi holis hollister hollywood hollywoods holmfirth holyhead holywood homebargains hon honeywell honeywells honley honolulu honorable honourable hons hoover hopefoundationgala hopefoundationgalas hopkins horbury hornsea horsforth hotate hotates hotpoint houseoffraser houston hove howden hoyland hp hps hr hrh hrs hrv hrvs html5 https huddersfield hudson hudsons hugoboss huila huilas hull humberside hungary hunslet hunter hunters huntington huntsville hwy hwys hydepark hyderabad i ian ians ib ibs iceland icelands icu icus idaho ideo ideos idle iga igp igps ii iis il ilkley illinois ils im imam imams imax imaxs imposition ims inbody inbodys inc incididunt incididunts incs indesign indesigns indesit indiana indianapolis insp inspector inspectors insps insta instagram intake intermarche intl intls invercargill inverness invisalign invisaligns iowa ip ipo ipos ips ipsum ipsums ipswich iq iqs ireland irene irenes iris ironandpulse ironandpulses irr irrs irure irures irvine irving isaac isaacs isabella isabellas isaiah isaiahs isla islamabad islas islay islays ist istanbul ists ital italia italian italians italias itals italy iv ivs ivy ivys izakaya izakayas jack jacks jackson jacksons jacksonville jacob jacobs jakarta jalisco jaliscos james jameson jamesons jamie jamies jan jane janedoe janedoes janes jans january januarys japanese japaneses jarrow jason jasons jasper jaspers jaxon jaxons jayden jaydens jdsports jeffrey jeffreys jenkins jennifer jennifers jeremiah jeremiahs jerry jerrys jerseycity jerusalem jesse jesses jessica jessicas jimenez jimenezs jira jiras joe joel joels joes johannesburg john johndoe johndoes johnlewis johnny johnnys johns johnson johnsons jonathan jonathans jones jordan jordans jordanthorpe jose josefin josefins joseph josephs joses joshua joshuas josiah josiahs joules jpegs jpgs jr jrs js jsmith jsmiths json jude's judge judges judith judiths jul julia julian julianmoretti julianmorettis julians julias julie julies juls july julys jumbo jumbos jun june junes juneteenth juneteenths junior juniors junmai junmais juns juris justeat justice justices justin justins jvance jvances kabul kafka kafkas kahlua kahluas kai kais kaitakahashi kaitakahashis kansas kansascity karachi karen karens kate kates katherine katherines kathleen kathleens kathmandu kaytranada kaytranadas keighley keith keiths kelowna kendal kendrick kendricks kenji kenjis kennedy kennedys kensington kensingtons kent kentucky kerning kettering kevin kevins keyfood kfc kiev kilkeel kilkenny kilmarnock kilnhurst kim kims kincardineshire king kings kingsbridge kingsbridges kingston kingstons kinross kinsley kippax kirkburton kirkbymoorside kirkcaldy kirkcudbrightshire kirkstall kitchener kiveton kivetonpark km kms kn knaresborough knottingley knoxville kns knutsford kolkata kombucha kombuchas kosho koshos kosovo kouign kouigns kroger krogers kualalumpur kubernetes kunsthalle kunsthalles kunsthallestudio kunsthallestudios kuroshio kuroshios kuroshiosushi kuroshiosushis kuwait kwanzaa kwanzaas kwiksave kyiv kyle kyles kyoto kyotos l'atelier labore labores laboris laborum laborums labrador lacoste ladies lady lagos lahore lamar lamars lanarkshire lancashire lancaster lance landon landons lao laos lapaz laredo larne lasvegas lato latos latvia laude laudes launceston laura lauras lauren laurens laurent laurents lawfirm lawfirms lawrence lawrences layla laylas lb lbs le leah leahs lecturer lecturers ledsham ledston lee leeds lees leicester leicestershire leigh leo leo's leonardo leonardos leos leprechaun leprechauns les levain levains levi levis lexington leyburn leyland lg liam liams lidl lidls lieut lieutenant lieutenants lieuts lifecycle lifecycles ligatures lightmode lily lilys lima limavady limerick lincoln lincolns lincolnshire linda lindas lindqvist lindqvists linkedin lisa lisas lisbon lisburn listerhills lithuania littlerock liverpool livestream livestreamed livestreaming livestreams livingston ljubljana llandudno llanelli llm llms lloyds lloydspharmacy llp llps lms lofthouse logan logans londis london londonderry longbeach lookbook lookbooks lopez lopezs lora loras lord lords lorem lorems losangeles lothian lotussanctuaryspa lotussanctuaryspas loughborough louis louisiana louisville lowmoor loyola loyolas lt lts lubbock luca lucas lukas luke lukes lululemon lumi lumiere lumieres lumierestudio lumierestudios lumierevisuals lumis luna lunas lush luton lyft lys macclesfield macedonia mackay madagascar madagascars madison madisons madrid maeda maedas magherafelt magistrate magistrates magna magnas maidstone maine maison maisoneleve maisoneleves maisonfleur maisonfleurs maisonrosebeauty maisonrosebeautys maisons maisonstudio maisonstudios maj majesties majesty major majors majs makerspace makerspaces makro malta maltby malton manchester mango manila manitoba maplewood maplewoods maplin mapplewell mar marcellus march marchs marco marcos marcus mardigras margaret margarets margate margherita margheritas marie maries mark marketweighton marks marksandspencer marksandspencers marquess marquis marquises mars marshal marshall marshalls marshals martha marthas martinez martinezs mary maryland marys marzano marzanos mason masons massachusetts massimo massimos master masterplan masterplans matalan matcha matchas mateo mateos matteo matteos matthew matthews maverick mavericks max maxs may maya mayas mayor mayoress mayoresses mayors mays mcdonalds mckinsey mckinseys md mdcccxii mdcccxiis mds meadowbrook meadowbrooks meanwood medcare medcares medicalcenter medicalcenters medjool medjools meijer melbourne meltham memphis mendoza mendozas menorah menorahs menston mercadona meridianmotors merriweather merriweathers merseyside merthyr merthyrtydfil mesa messrs metadata methley metrocitymarathon metrocitymarathons mexborough mexicocity meyer meyers mezcalita mezcalitas mfa mfas mgmt mgmts mia miami mias micah micahs michael michaels michelin michelins michigan micklefield microservices microsoft microsofts middlesbrough middlesex middlestown middleton middot middots midsummer midsummers midweek midweeks midwinter midwinters miele mila milan milano milanos milans milas mildura miles milfordhaven miller millers milo milos miltonkeynes milwaukee min mindsetmastery mindsetmasterys minim minimap minimaps minims minister ministers minneapolis minnesota mins minsk mirfield miss mississippi missouri mistletoe mistletoes mit mitchell mitchells mits miyazaki miyazakis ml mlle mlles mlops mls mme mmes moldova molestie molesties mollit mollits mon moncton monday mondays monkbretton monmouthshire monoprix monospace mons monsieur monsieurs monsignor montaigne montaignes montana montenegro montevideo montgomery montreal montrose montroses montserrat montserrats monzo moore moores moorthorpe moortown morales morayshire morecambe moretti morettis morley morningside morningsides moroccan moroccans morpeth morrison morrisons mosborough moscone moscones moscow motherwell mp mph mphs mps mr mri mris mrs ms msgr msrp msrps mst msts mufti muftis mulberry mullingar multi multis mumbai muscat mvance mvances mvp mvps mx myofascial myofascials naas nairnshire nairobi nancy nancys nandos nantwich napier naples napoletana napoletanas napoli napolis nashville nathan nathans navan ncaa ncaas nd nds neath neathporttalbot nebraska nelson neonnights nero nespresso netflix netheredge netherlands netherton netto nettos neue neues nevada newark newbridge newbrunswick newcastle newfoundland newhampshire newjersey newlook newmexico newmillerdam neworleans newplymouth newport newquay newry newsouthwales newtonmearns newtownabbey newtownards newyear newyears newyork next nexusai nexusais nexusaistudio nexusaistudios nexuscareers nfts nguyen nguyens nicholas nicosia nike nikes nikiri nikiris nikon ninja nlp nlps noah noahs noel noels noirstudio noirstudios nolan nolans nonna nonnas nora noras nordicco nordiccos norfolk normanton northallerton northampton northamptonshire northcarolina northdakota northferriby northshields northumberland northwich northyorkshire norway norwegian norwegians norwich nostrud nostruds nottingham nottinghamshire notton nov nova novas novascotia november novembers novs nulla nullam nullams nullas nunavut nutcracker nutcrackers nw nws nyt nyts o oakland oakridge oakridges oakwood oakworth oaxaca oaxacas oban ocado ocados occaecat occaecats oceania oct october octobers octs odesza odeszas officer officers officia officias ohio oj ojs oklahoma oklahomacity oldham oliver olivers olivia olivias olympic olympics omagh omaha omakase omakases omega onboarding ontario openpub openpubs opub orange orbitron orbitrons oregon org orgs orkney orlando ormskirk ortiz ortizs oscar oscars osha oshas oshawa oslo ossett osteria osteriabellini osteriabellinis osterias oswald oswalds otd otds otley ottawa oulton outwood overton owen owens oxenhope oxford oxfordshire oz ozs paddleboarding paddleboardings padre paisley palmerstonnorth palo paloma palomas palos pamela pamelas panasonic pandora panela panelas papajohns parfum parfums pariatur pariaturs paris parisian parisians parliamentarian parliamentarians parma parmas parsoncross pasadena pasadenas passionfruit passionfruits pastor pastors patagonia patagonias patel patels patricia patricias patrick patricks paul paula paulas pauls pawdicure pawdicures pawsandpamper pawsandpampers paypal pcs pcworld pdfs peacocks pearson pearsons peated peateds peeblesshire pembroke pembrokeshire pendleton pendletons pendletontribute pendletontributes penelope penelopes penistone pennsylvania pennys penrith penzance pepe pepes perez perezs perth perthshire peter peterborough peterhead peters petsathome pexels pg pgs ph philadelphia philip philips phillips phoenix phs pickering pico picos pigglywiggly pilates pinecrest pinecrests pinterest pitmaster pitmasters pitsmoor pittsburgh pixabay pizzaexpress pizzahut pizze pizzes pkwy pkwys placeholder placeholders plano playfair playfairs plg plgs plt plymouth pm pmo pmolead pmoleads pmos pmp pmps pms pngs pocklington podcaster podcasters podcasts podgorica poinsettia poinsettias poland pommes pontefract pontypridd pool poole pope popes popover popovers poppins poppleton portland portlaoise portmacquarie portrush portsmouth portstewart portugal postgres postgresql postgresqls potternewton poundland poundstretcher poundworld powys ppi pr prada prague pranasanctuary pranasanctuarys pranayogastudio pranayogastudios prancer prancers prelate premier premiers pres preses president presidents preston pret pretoria prettylittlething priest priests primark primate primates primeminister prince princes princess princesses principal principals pristina pritzker pritzkers private privates prof professor professors profs proident proidents proofing provencal provencals provence provences providence provost provosts prs pta ptas publix pudsey puertorico pugliese puglieses pulitzer pulitzers pullandbear purston pvt pvts pwa pytorch pytorchs qa qas qrcode qrcodes qsbs quantumflow quantumflows quattro quattros quebec queen queens queensbury queensland quesabirria quesabirrias queso quesos quinn quinns quis quito rabat rabbi rabbinical rabbis rachel rachels raleigh ralph ralphlauren ralphs ramadan ramadans ramirez ramirezs ramos ramsgate randy randys ranmoor raster ravenwood ravenwoods rawcliffe rawdon rawmarsh raymond raymonds rd rds reading rebecca rebeccas rector rectors redcar reddit redditor redis reebok reggiano reggianos regina reid reids reindeer reindeers renfrew renfrewshire reno rep reprehenderit reprehenderits representative representatives reps req reqs reserved retweets rev reverend reverends revit revits revolut revs rewe reyes reykjavik rgba rhode rhodeisland rhodes rhonddacynontaf rhyl riccall richard richards richmond riga right rignon rignons riley rileys riodejaneiro ripon risd risds ristretto ristrettos rituals river rivera riveras riverisland rivers riverside riyadh rn rns roadmap roadmaps roas roastery roasterys robata robatas robert roberts robinhood robinson robinsons roboto robotos rochdale rochester rockefeller rockefellers rockerslive rockerslives rockhampton rodriguez rodriguezs roger rogers roi rois rolex roman romania romans rome romero romeros roosevelt roosevelts ros rosal rosals rosse rosses rossi rossington rossis rosso rossos rostova rostova's rostovas rotherham rothwell rotorua roundhay rowan rowans roxburghshire roy royal royale royales roys royston rpg rpgs rpm rpms rt rudolph rudolphs rufus ruiz ruizs runcorn runtime runtimes rush rushden russell russells russia ruth rutherglen ruths rutland ry ryan ryans ryder ryders ryhill ryman rymans rys saas sacramento safeway safeways saguenay sahara saharas sainsbury sainsburys saintlouis saintpaul saintpetersburg saison saisons sakura sakuras sale salem salems salford salisbury saltaire saltlake saltlakecity samsung samuel samuels sanantonio sanchez sanchezs sandal sanders sandiego sandra sandras sanfrancisco sanjose sansserif santa santa's santaana santas santiago santiagos santorini santorinis saopaulo sarah sarahs sarajevo sartoria sartorias sas saskatchewan saskatoon sat sato satos sats saturday saturdays sauvignon sauvignons savannah savers saveur saveurs sc scamorza scamorzas scarborough scarcroft scarlett scarletts scholes schoolbell schoolbells schuh sci scis scissett scotland scott scotts scottsdale screenshots screenshotted screwfix scs sdk sdks se seabob seabobs seacroft sean seans seattle sebastian sebastians sed sedona sedonas seds seiko selby selfies selfridges selkirkshire sen senator senators senior seniors senor senora senoras senores senorita senoritas sens seo seos seoul sep sephora seps sept september septembers septs serbia serengeti serengetis serenityspa serenityspas sergeant sergeants sergt sergts serif serifs serverless ses sesquicentennial sesquicentennials settle sf sfs sg sgs sgt sgts shadwell shakshuka shakshukas shamrock shamrocks shanghai shareables shark sharlston sharon sharons sheepscar sheffield sheikh sheikhs shein shepparton sherbrooke sherburn sheriff sheriffs shetland shields shipley shizuoka shizuokas shoprite shrewsbury shropshire sicilian siciliani sicilianis sicilians sicily sicilys siemens signor signora signore signori signorina signorine silas silkstone silsden simon simons singapore sint sints siouxfalls sir sirs sister sisters sit sitewide sitewides sits skellow skelmanthorpe skelmersdale sketchup sketchups skipton skopje sku skus skype skywwalk skywwalks sla slack slas sligo slough slovakia slovenia sm smartsheet smartsheets smb smbs smeg smith smiths sms snaith snapchat snappy snappysnaps snaps snowman snowmans snowmen snowmens sofia soir soirs solaris solicitor solicitors solidworks solstice solsticefestival solsticefestivals solstices somerfield somerset sonoma sonomas sonoran sonorans sonos sony sophia sophiaandjulian sophiaandjulians sophias soppressata soppressatas soren sorens sothall sotherby sotherbycrown sotherbycrowns sotherbys soundcheck soundchecks southampton southaustralia southcarolina southcave southdakota southelmsall southend southkirkby southport southshields southyorkshire sovereignestates sowerby sowerbybridge spacenk spain spanish spanishs spar sparklingcleanhomes spars spc spcs spellcheck spellchecker spenborough spencer spencers spokane spoons sportsdirect spotify springtime springtimes sprotbrough spudshed sq sqft sqfts sql sqls sqs squalane squalanes sr sriracha srirachas srs stafford staffordshire stainforth stairfoot stalbans standrews stanford stanfords stanley stanningley stannington staples starbucks starling starlink starlinks steeton stella stellas stephen stephens sterlingvance sterlingvancecpa sterlingvancecpas sterlingvances steve stevenage steves sthelens stirling stirlingshire stives stjohns stlouis stockholm stockport stocksbridge stockton stoke stopandshop storytime storytimes stpatrick stpatricks stpaul stpetersburg strabane stradivarius strathclyde streethouse strensall stretford stridesofhope stridesofhopes stripe studioforma studioformas studiolumiere studiolumieres stylesheet stylesheets subpixel subways sudbury suffolk summa summas summertime summertimes sun sunday sundays sunderland sunnyside suns sunt sunts supercuts superdrug superdry superintendent superintendents supt supts surrey susan susans sussex sutherland svgs sw swallownest swami swamis swansea swarovski swatch swatches sweden swillington swindon swinton switzerland sws sydney sza szas tablescapes tableside tablesides tacoma tadcaster tagheuer tagliarin tagliarins tagout tagouts tahitian tahitians tajin tajins takahashi takahashis tallahassee tallinn tampa tamworth target targets tasmania tataki tatakis tatecollective tatecollectives taunton tauranga taylor taylors tbilisi tbwa tbwas teamlab teamlabs teau teaus techflow techflows tees tehran telaviv telegram telford tellicherry tellicherrys tempor tempors temu tenby tennessee teresa teresas terry terrys tesco tescos texas textbox textboxes th thackley thalasso thalassos thanet thanksgiving thanksgivings thebodyshop theillustrious theo theodore theodores theos therange thesaurus thirsk thomas thompson thompsons thorne thorner thornton thorntonfamily thorntonfamilys thorpe thrybergh ths thu thur thurnscoe thurs thursday thursdays thus tibetan tibetans tickhill tierra tierras tiffany tiktok timberland timhortons timothy timothys tingley tinshill tirana tjmaxx tkmaxx tncc tnccs todmorden todwick tokyo toledo tommyhilfiger toniandguy tonnato tonnatos toolstation tooltip tooltips toowoomba topman topshop torbay torfaen toronto torquay torres totley townsville tracking traderjoes tradizionale tradizionales tralee transitioned transitioneds treeton tri tripoli tris troisrivieres trooper troopers truro tsukiji tsukijis tucker tuckers tucson tue tues tuesday tuesdays tulsa tunbridge tunis turkey tuscany tuscanys tutor tutors tv tvs tx txs tyler tylers tyneandwear tynemouth typeface typefaces tyrone tzu tzus uber ubereats ucl ucla uclas ucls ui uis uji ujis uk ukraine uks ullamco ullamcos ulster umea umeas unagi unagis unboxing underarmour undercliffe unfollow unfollowed uniqlo unsplash upton url urls usa usas usatf usatfs usd usds utah ux uxs valentine valentines valeofglamorgan valletta valmont valmonts vance vancehorology vancehorologys vancemarketing vancemarketings vances vancesterlinglaw vancesterlinglaws vancouver vanguardheritage vanguardheritages vans vasquez vasquezs vata vatas vax ve vector vehicula vehiculas velit velits velvetalchemy velvetalchemys veniam veniams venmo verace veraces vercel vercels verdantkitchen verdantkitchens verde verdes vermont versace vertexlabs ves vicar vicars vicechancellor victor victoria victorias victors vienna viewport vilnius vincent vincents vinted vinyasa vinyasas violet violets violette violettes vip vips virginia virginiabeach viscount viscountess viscountesses viscounts visionos vitalitypro vitalitypros vitello vitellos vivamus vixen vixens vlogger vloggers vo voluptate voluptates vos vp vpc vpcs vps vr vrs vs wa wadsley wagga waitrose waitroses wakefield wales walker walkers walkley walkthrough walkthroughs wallasey wallsend walmart walmarts walter walters walton warden wardens warrenpoint warrington warsaw warwickshire was washington washingtondc waterford waterstones watford wath waylon waylons wayne waynes webassembly webassemblys webfonts webgl webgls webgpu webgpus webp wed wednesday wednesdays weds weekday weekdays weekend weekends weeknd weeknds weetwood wegmans wellington wellpharmacy welwyn wendy wendys wesley wesleys wessex westernaustralia westhighboosters westmidlands westvirginia westwood westyorkshire wetherby wetherspoon wetherspoons wexford weymouth wght wghts whanganui whangarei wharton whartons whatsapp wheatley whiston whitby whitehaven whitfield whitfields whitkirk whitleybay wholefoods whsmith wichita wickersley wickes widnes wieden wiedens wifi wigan wigtownshire wildearth wildearths wildflowerfern wildflowerferns wilkinsons wilko willerby william williams willie willies willoughby willow willows wilmslow wilsden wilshire wilshires wilson wilsons wiltshire winchester windsor winndixie winnipeg winsford winstonsalem wintergala wintergalas wintertime wintertimes wireframe wireframes wiretech wiretechs wirral wisconsin wishaw withernsea wodonga woking wollongong wolverhampton wombwell woodall woodhouse woodlands woodlesford woodseats woodway woodways woolies woolley woolworths worcester worcestershire wordart workflows workington worthing wortley wrenthorpe wrexham wt wts www wwws wyatt wyatts wyke wyoming xavier xaviers xmas xml xr xrs xx xxs yeadon yeovil yerevan yirgacheffe yirgacheffes york yorkshire youtube youtuber youtubers yoy yoys yr yrs yukon yuletide yuletides zachary zacharys zagreb zaha zahas zane zanes zanussi zara zion zions zoey zoeys zoom zurich zurichs";
    _builtinGoodWords.split(' ').forEach(w => {
        if (w) _knownGoodWords.add(w.toLowerCase().trim());
    });
    ['a', 'i', 'o'].forEach(w => _knownGoodWords.add(w));
    const _suggestionsMap = new Map();
    const _editableCache = new Map(); // editable element -> { text, grammarMatches }
    let _debounceTimer = null;
    let _activeFetches = new Map();

    const WORD_REGEX = /[A-Za-z]+(?:['’][A-Za-z]+)?/g;
    const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
    const PHONETIC_RULES = [
        ['ite', 'ight'], ['ight', 'ite'],
        ['ph', 'f'], ['f', 'ph'],
        ['c', 'k'], ['k', 'c'],
        ['c', 's'], ['s', 'c'],
        ['sc', 's'], ['s', 'sc'],
        ['ie', 'ei'], ['ei', 'ie'],
        ['tion', 'sion'], ['sion', 'tion'],
        ['able', 'ible'], ['ible', 'able'],
        ['ant', 'ent'], ['ent', 'ant'],
        ['ance', 'ence'], ['ence', 'ance'],
        ['dg', 'g'], ['g', 'dg'],
        ['qu', 'kw'], ['kw', 'qu'],
        ['x', 'cks'], ['cks', 'x'],
        ['ll', 'l'], ['l', 'll'],
        ['cc', 'c'], ['c', 'cc'],
        ['mm', 'm'], ['m', 'mm'],
        ['ss', 's'], ['s', 'ss'],
        ['pp', 'p'], ['p', 'pp'],
        ['rr', 'r'], ['r', 'rr'],
        ['tt', 't'], ['t', 'tt'],
        ['ff', 'f'], ['f', 'ff'],
        ['nn', 'n'], ['n', 'nn'],
        ['dd', 'd'], ['d', 'dd'],
        ['bb', 'b'], ['b', 'bb'],
        ['gg', 'g'], ['g', 'gg']
    ];

    const TITLE_SPECS = {
        'mr': { replacements: ['Mr.', 'Mr'] },
        'mrs': { replacements: ['Mrs.', 'Mrs'] },
        'ms': { replacements: ['Ms.', 'Ms'] },
        'miss': { replacements: ['Miss'], contextCheck: true },
        'dr': { replacements: ['Dr.', 'Dr'] },
        'prof': { replacements: ['Prof.', 'Prof'] },
        'cllr': { replacements: ['Cllr.', 'Cllr'] },
        'rev': { replacements: ['Rev.', 'Rev'] },
        'fr': { replacements: ['Fr.', 'Fr'], contextCheck: true },
        'capt': { replacements: ['Capt.', 'Capt'] },
        'col': { replacements: ['Col.', 'Col'] },
        'gen': { replacements: ['Gen.', 'Gen'], contextCheck: true },
        'maj': { replacements: ['Maj.', 'Maj'], contextCheck: true },
        'lt': { replacements: ['Lt.', 'Lt'] },
        'lieut': { replacements: ['Lieut.', 'Lieut'] },
        'sgt': { replacements: ['Sgt.', 'Sgt'] },
        'cpl': { replacements: ['Cpl.', 'Cpl'] },
        'pvt': { replacements: ['Pvt.', 'Pvt'], contextCheck: true },
        'sen': { replacements: ['Sen.', 'Sen'] },
        'rep': { replacements: ['Rep.', 'Rep'], contextCheck: true },
        'sir': { replacements: ['Sir'], contextCheck: true },
        'lady': { replacements: ['Lady'], contextCheck: true },
        'lord': { replacements: ['Lord'], contextCheck: true },
        'dame': { replacements: ['Dame'], contextCheck: true },
        'pastor': { replacements: ['Pastor'], contextCheck: true },
        'rabbi': { replacements: ['Rabbi'], contextCheck: true },
        'imam': { replacements: ['Imam'], contextCheck: true },
        'sheikh': { replacements: ['Sheikh'], contextCheck: true },
        'alderman': { replacements: ['Alderman'], contextCheck: true },
        'mayor': { replacements: ['Mayor'], contextCheck: true },
        'doctor': { replacements: ['Doctor'], contextCheck: true },
        'professor': { replacements: ['Professor'], contextCheck: true },
        'reverend': { replacements: ['Reverend'], contextCheck: true },
        'detective': { replacements: ['Detective'], contextCheck: true },
        'inspector': { replacements: ['Inspector'], contextCheck: true },
        'constable': { replacements: ['Constable'], contextCheck: true },
        'officer': { replacements: ['Officer'], contextCheck: true },
        'governor': { replacements: ['Governor'], contextCheck: true },
        'president': { replacements: ['President'], contextCheck: true }
    };

    const CAPITALIZED_TITLES = new Set([
        'Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof', 'Cllr', 'Rev', 'Fr',
        'Capt', 'Col', 'Gen', 'Maj', 'Lt', 'Lieut', 'Sgt', 'Cpl', 'Pvt',
        'Sen', 'Rep', 'Sir', 'Lady', 'Lord', 'Dame', 'Pastor', 'Rabbi',
        'Imam', 'Sheikh', 'Alderman', 'Mayor', 'Judge', 'Justice', 'Father', 'Sister',
        'Doctor', 'Professor', 'Reverend', 'Detective', 'Inspector', 'Constable',
        'Officer', 'Governor', 'President'
    ]);

    const NON_NAME_FOLLOWERS = new Set([
        'and', 'or', 'but', 'nor', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for',
        'with', 'by', 'from', 'of', 'is', 'was', 'are', 'were', 'be', 'been',
        'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
        'should', 'can', 'could', 'may', 'might', 'must', 'that', 'this',
        'these', 'those', 'it', 'its', 'you', 'your', 'we', 'our', 'they',
        'their', 'he', 'his', 'she', 'her', 'them', 'me', 'my', 'him', 'who',
        'whom', 'whose', 'which', 'what', 'where', 'when', 'why', 'how', 'not',
        'so', 'if', 'then', 'as', 'than', 'too', 'very', 'just', 'also'
    ]);

    const CALENDAR_WORDS = {
        'monday': 'Monday', 'tuesday': 'Tuesday', 'wednesday': 'Wednesday',
        'thursday': 'Thursday', 'friday': 'Friday', 'saturday': 'Saturday', 'sunday': 'Sunday',
        'january': 'January', 'february': 'February', 'april': 'April',
        'june': 'June', 'july': 'July', 'august': 'August', 'september': 'September',
        'october': 'October', 'november': 'November', 'december': 'December'
    };

    /**
     * Scans an editable element for fast, local grammatical, title, and proper-noun casing rules.
     */
    function scanLocalGrammarRules(rootEditable) {
        if (!rootEditable || !isGrammarEnabled()) return [];
        if (typeof state !== 'undefined' && state.spellCheck === false) return [];
        if (rootEditable.classList.contains('wa-text') || rootEditable.getAttribute('data-spellcheck') === 'false') return [];

        const walker = document.createTreeWalker(rootEditable, NodeFilter.SHOW_TEXT);
        const tokens = [];
        let textNode;

        while ((textNode = walker.nextNode())) {
            const text = textNode.textContent;
            if (!text) continue;

            WORD_REGEX.lastIndex = 0;
            let match;
            while ((match = WORD_REGEX.exec(text)) !== null) {
                const raw = match[0];
                const start = match.index;
                const end = start + raw.length;

                // Check trailing dot (e.g. "mr." or "Mr.")
                const hasTrailingDot = (text[end] === '.');

                // Check preceding non-whitespace character in textNode
                let charBefore = '';
                for (let i = start - 1; i >= 0; i--) {
                    if (!/\s/.test(text[i])) { charBefore = text[i]; break; }
                }

                // Check preceding sibling for line/block break if start of node
                let isAfterBlockBreak = false;
                if (start === 0 || !charBefore) {
                    let prevNode = textNode.previousSibling;
                    while (prevNode && prevNode.nodeType === 3 && !prevNode.textContent.trim()) {
                        prevNode = prevNode.previousSibling;
                    }
                    if (!prevNode || prevNode.nodeName === 'BR' || prevNode.nodeName === 'DIV' || prevNode.nodeName === 'P') {
                        isAfterBlockBreak = true;
                    }
                }

                tokens.push({
                    raw: raw,
                    lower: raw.toLowerCase(),
                    hasTrailingDot: hasTrailingDot,
                    textNode: textNode,
                    startOffset: start,
                    endOffset: hasTrailingDot ? end + 1 : end, // include period in range if it was "mr." so replacement is clean
                    wordEndOffset: end,
                    isAfterBlockBreak: isAfterBlockBreak,
                    charBefore: charBefore
                });
            }
        }

        // Link prev and next tokens
        for (let i = 0; i < tokens.length; i++) {
            tokens[i].prev = (i > 0) ? tokens[i - 1] : null;
            tokens[i].next = (i < tokens.length - 1) ? tokens[i + 1] : null;
        }

        const matches = [];

        function addMatch(token, ruleId, message, replacements, customRange) {
            if (_ignoredRulesSet.has(ruleId)) return;
            let range = customRange;
            if (!range) {
                try {
                    range = new Range();
                    range.setStart(token.textNode, token.startOffset);
                    range.setEnd(token.textNode, token.endOffset);
                } catch(e) {
                    return;
                }
            }

            matches.push({
                text: token.raw,
                ruleId: ruleId,
                message: message,
                shortMessage: 'Capitalization',
                replacements: replacements,
                range: range,
                offset: token.startOffset,
                length: token.endOffset - token.startOffset
            });
        }

        for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i];
            const lower = t.lower;
            const isAllLower = (t.raw === lower);

            // Skip pure spelling mistakes (they receive red squiggly underlines)
            if (isWordMisspelled(t.raw)) continue;

            // 1. Check TITLE_CAPITALIZATION
            let isTitleToken = false;
            let titleSpec = TITLE_SPECS[lower] || null;

            if (titleSpec) {
                if (titleSpec.contextCheck) {
                    if (t.next && !NON_NAME_FOLLOWERS.has(t.next.lower)) {
                        isTitleToken = true;
                    } else if (t.isAfterBlockBreak && t.next) {
                        isTitleToken = true;
                    }
                } else {
                    isTitleToken = true;
                }
            } else if (CAPITALIZED_TITLES.has(t.raw)) {
                isTitleToken = true;
            }

            if (isTitleToken && titleSpec && isAllLower) {
                // Lowercase title error
                addMatch(
                    t,
                    'TITLE_CAPITALIZATION',
                    'Honorific titles should be capitalized (e.g. ' + titleSpec.replacements[0] + ' or ' + titleSpec.replacements[1] + ').',
                    titleSpec.replacements
                );
                t._handled = true;
            }

            // 2. Check TITLE_NAME_CAPITALIZATION (words following a title)
            if (isTitleToken) {
                let curr = t.next;
                while (curr && !curr.isAfterBlockBreak && !NON_NAME_FOLLOWERS.has(curr.lower) && curr.raw === curr.lower) {
                    if (!isWordMisspelled(curr.raw)) {
                        const capName = curr.raw.charAt(0).toUpperCase() + curr.raw.slice(1);
                        let nameRange;
                        try {
                            nameRange = new Range();
                            nameRange.setStart(curr.textNode, curr.startOffset);
                            nameRange.setEnd(curr.textNode, curr.wordEndOffset);
                        } catch(e) {}

                        addMatch(
                            curr,
                            'TITLE_NAME_CAPITALIZATION',
                            'Names and surnames following a title should be capitalized.',
                            [capName],
                            nameRange
                        );
                        curr._handled = true;
                    }
                    if (curr.hasTrailingDot || (curr.textNode.textContent[curr.wordEndOffset] === ',')) {
                        break;
                    }
                    curr = curr.next;
                }
            }

            // 3. Pronoun 'i'
            if (lower === 'i' && t.raw === 'i' && !t._handled) {
                addMatch(
                    t,
                    'PRONOUN_I',
                    'The pronoun \'I\' should always be capitalized.',
                    ['I']
                );
                t._handled = true;
            }

            // 4. Days and Months
            if (CALENDAR_WORDS[lower] && isAllLower && !t._handled) {
                addMatch(
                    t,
                    'PROPER_NOUN_CALENDAR',
                    'Days of the week and months should be capitalized.',
                    [CALENDAR_WORDS[lower]]
                );
                t._handled = true;
            }

            // 5. Repeated words (e.g. "the the", "in in", "and and")
            if (t.prev && t.prev.lower === lower && !t.isAfterBlockBreak && !t._handled && lower.length > 1 && lower !== 'that' && lower !== 'had') {
                addMatch(
                    t,
                    'WORD_REPEAT_RULE',
                    'Possible repeated word found.',
                    ['']
                );
                t._handled = true;
            }
        }

        return matches;
    }

    function mergeGrammarMatches(localMatches, remoteMatches) {
        if (!remoteMatches || remoteMatches.length === 0) return localMatches || [];
        if (!localMatches || localMatches.length === 0) return remoteMatches;

        const result = [...localMatches];
        for (const rm of remoteMatches) {
            const rmText = (rm.text || '').toLowerCase().trim();
            const overlaps = localMatches.some(lm => {
                const lmText = (lm.text || '').toLowerCase().trim();
                if (lmText === rmText || lmText.includes(rmText) || rmText.includes(lmText)) return true;
                if (lm.range && rm.range) {
                    try {
                        const endsAfterStart = lm.range.compareBoundaryPoints(Range.END_TO_START, rm.range) > 0;
                        const startsBeforeEnd = lm.range.compareBoundaryPoints(Range.START_TO_END, rm.range) < 0;
                        if (endsAfterStart && startsBeforeEnd) return true;
                    } catch(e) {}
                }
                return false;
            });
            if (!overlaps) {
                result.push(rm);
            }
        }
        return result;
    }

    // Load custom dictionaries and ignored rules from localStorage
    function loadPreferences() {
        try {
            const savedCustom = localStorage.getItem('opub_custom_dictionary');
            if (savedCustom) {
                const arr = JSON.parse(savedCustom);
                if (Array.isArray(arr)) {
                    arr.forEach(w => _customDictSet.add(w.toLowerCase().trim()));
                }
            }
            const savedIgnored = localStorage.getItem('opub_ignored_words');
            if (savedIgnored) {
                const arr = JSON.parse(savedIgnored);
                if (Array.isArray(arr)) {
                    arr.forEach(w => _ignoredWordsSet.add(w.toLowerCase().trim()));
                }
            }
            const savedRules = localStorage.getItem('opub_ignored_grammar_rules');
            if (savedRules) {
                const arr = JSON.parse(savedRules);
                if (Array.isArray(arr)) {
                    arr.forEach(r => _ignoredRulesSet.add(r));
                }
            }
        } catch(e) {
            console.warn('Failed to load proofing preferences:', e);
        }
    }

    loadPreferences();

    /**
     * Checks if grammar error marking is globally enabled.
     */
    function isGrammarEnabled() {
        if (typeof state !== 'undefined' && state.grammarCheck !== undefined) {
            return !!state.grammarCheck;
        }
        return localStorage.getItem('opub_grammarcheck') !== 'false';
    }

    /**
     * Checks if a word token is eligible for spell checking.
     */
    function isCheckableWord(rawWord) {
        if (!rawWord) return false;
        const clean = rawWord.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        if (!clean) return false;
        if (clean.length === 1 && clean !== 'a' && clean !== 'i' && clean !== 'o') return false; // Single letters ignored except a/i/o
        
        const ignoreNumbers = localStorage.getItem('opub_ignore_numbers') !== 'false';
        if (ignoreNumbers && /[0-9_]/.test(rawWord)) return false; // Numbers/symbols ignored
        
        const ignoreUppercase = localStorage.getItem('opub_ignore_uppercase') !== 'false';
        if (ignoreUppercase && rawWord === rawWord.toUpperCase() && rawWord.length >= 2 && rawWord.length <= 5) return false; // Acronyms (PDF, PNG, SVG)
        
        if (_customDictSet.has(clean) || _ignoredWordsSet.has(clean)) return false;
        return true;
    }

    /**
     * Checks if a word exists in the dictionary, custom dictionary, or ignored words.
     */
    function isWordInDictionary(word) {
        if (!word) return true;
        const clean = word.toLowerCase().trim().replace(/^\.+|\.+$/g, "");
        if (!clean) return true;

        if (clean === 'a' || clean === 'i' || clean === 'o') {
            return true;
        }

        if (_customDictSet.has(clean) || _ignoredWordsSet.has(clean) || _knownGoodWords.has(clean)) {
            return true;
        }

        const straightApos = clean.replace(/[\u2018\u2019]/g, "\x27");
        if (_customDictSet.has(straightApos) || _ignoredWordsSet.has(straightApos) || _knownGoodWords.has(straightApos)) {
            return true;
        }

        const noApos = straightApos.replace(/\x27/g, "");
        if (_customDictSet.has(noApos) || _ignoredWordsSet.has(noApos) || _knownGoodWords.has(noApos)) {
            return true;
        }

        // Possessive form check: e.g. "publisher's" -> "publisher", "asda's" -> "asda"
        if (straightApos.endsWith("\x27s")) {
            const base = straightApos.slice(0, -2);
            if (_customDictSet.has(base) || _ignoredWordsSet.has(base) || _knownGoodWords.has(base)) return true;
            if (window.OPUB_DICTIONARY && window.OPUB_DICTIONARY.has(base)) return true;
        }
        // Plural possessive form check: e.g. "publishers'" -> "publishers"
        if (straightApos.endsWith("s\x27")) {
            const base = straightApos.slice(0, -1);
            if (_customDictSet.has(base) || _ignoredWordsSet.has(base) || _knownGoodWords.has(base)) return true;
            if (window.OPUB_DICTIONARY && window.OPUB_DICTIONARY.has(base)) return true;
        }

        if (window.OPUB_DICTIONARY) {
            if (window.OPUB_DICTIONARY.has(clean)) return true;
            if (window.OPUB_DICTIONARY.has(straightApos)) return true;
            if (window.OPUB_DICTIONARY.has(noApos)) return true;
        }

        return false;
    }

    /**
     * Synchronously checks if a word is currently known to be misspelled.
     */
    function isWordMisspelled(word) {
        if (!word) return false;
        if (typeof state !== 'undefined' && state.spellCheck === false) return false;
        if (!isCheckableWord(word)) return false;

        const clean = word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        if (!clean) return false;

        if (clean === 'a' || clean === 'i' || clean === 'o') return false;

        if (isWordInDictionary(word)) return false;
        if (_knownBadWords.has(clean)) return true;

        // If offline dictionary is loaded, word is definitely misspelled
        if (window.OPUB_DICTIONARY) return true;

        return false;
    }

    /**
     * Maps character offsets within a root element's text to a DOM Range.
     * Robust against offset drift and DOM TreeWalker/innerText whitespace divergence
     * by anchoring to expectedText and snapping cleanly to token boundaries.
     */
    function createRangeForOffsets(root, startOffset, length, expectedText) {
        if (!root || length <= 0) return null;

        // Collect all text nodes with their cumulative offsets
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const textEntries = [];
        let fullText = '';
        let node;

        while ((node = walker.nextNode())) {
            const str = node.textContent;
            const start = fullText.length;
            fullText += str;
            textEntries.push({
                node: node,
                text: str,
                start: start,
                end: fullText.length
            });
        }

        if (textEntries.length === 0 || fullText.length === 0) return null;

        let targetStart = startOffset;
        let targetEnd = startOffset + length;

        // If expectedText is provided, find the exact or closest occurrence in fullText to avoid offset drift
        if (expectedText && typeof expectedText === 'string') {
            const exp = expectedText.trim();
            if (exp.length > 0) {
                let matchIndex = -1;
                // 1. Exact match at startOffset?
                if (fullText.substring(startOffset, startOffset + exp.length) === exp) {
                    matchIndex = startOffset;
                } else {
                    // 2. Search for closest exact occurrence
                    let closestDist = Infinity;
                    let idx = fullText.indexOf(exp);
                    while (idx !== -1) {
                        const dist = Math.abs(idx - startOffset);
                        if (dist < closestDist) {
                            closestDist = dist;
                            matchIndex = idx;
                        }
                        idx = fullText.indexOf(exp, idx + 1);
                    }

                    // 3. Case-insensitive search fallback
                    if (matchIndex === -1) {
                        const lowerFull = fullText.toLowerCase();
                        const lowerExp = exp.toLowerCase();
                        let lidx = lowerFull.indexOf(lowerExp);
                        closestDist = Infinity;
                        while (lidx !== -1) {
                            const dist = Math.abs(lidx - startOffset);
                            if (dist < closestDist) {
                                closestDist = dist;
                                matchIndex = lidx;
                            }
                            lidx = lowerFull.indexOf(lowerExp, lidx + 1);
                        }
                    }

                    // 4. Apostrophe normalization fallback (' vs ’)
                    if (matchIndex === -1) {
                        const normFull = fullText.replace(/’/g, "'").toLowerCase();
                        const normExp = exp.replace(/’/g, "'").toLowerCase();
                        let nidx = normFull.indexOf(normExp);
                        closestDist = Infinity;
                        while (nidx !== -1) {
                            const dist = Math.abs(nidx - startOffset);
                            if (dist < closestDist) {
                                closestDist = dist;
                                matchIndex = nidx;
                            }
                            nidx = normFull.indexOf(normExp, nidx + 1);
                        }
                    }
                }

                if (matchIndex !== -1) {
                    targetStart = matchIndex;
                    targetEnd = matchIndex + exp.length;
                }
            }
        }

        // Clamp to fullText bounds
        targetStart = Math.max(0, Math.min(targetStart, fullText.length));
        targetEnd = Math.max(targetStart, Math.min(targetEnd, fullText.length));

        // Trim any leading or trailing whitespace so squiggles never underline blank spaces or bleed into whitespace
        while (targetStart < targetEnd && /\s/.test(fullText[targetStart])) targetStart++;
        while (targetEnd > targetStart && /\s/.test(fullText[targetEnd - 1])) targetEnd--;
        if (targetStart >= targetEnd) return null;

        // Locate startNode and startOffsetInNode
        let startNode = null, startNodeOffset = 0;
        let endNode = null, endNodeOffset = 0;

        for (const entry of textEntries) {
            if (!startNode && targetStart >= entry.start && targetStart <= entry.end) {
                startNode = entry.node;
                startNodeOffset = targetStart - entry.start;
            }
            if (targetEnd >= entry.start && targetEnd <= entry.end) {
                endNode = entry.node;
                endNodeOffset = targetEnd - entry.start;
                break;
            }
        }

        // Fallback for endNode if targetEnd is at the very end
        if (!endNode && textEntries.length > 0) {
            const last = textEntries[textEntries.length - 1];
            endNode = last.node;
            endNodeOffset = last.text.length;
        }

        if (startNode && endNode) {
            try {
                const range = new Range();
                range.setStart(startNode, Math.min(startNodeOffset, startNode.textContent.length));
                range.setEnd(endNode, Math.min(endNodeOffset, endNode.textContent.length));
                return range;
            } catch(e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Classifies a LanguageTool match into 'spelling' (red) or 'grammar' (green).
     */
    function classifyMatch(m) {
        if (!m || !m.rule) return 'grammar';
        const catId = (m.rule.category && m.rule.category.id) ? m.rule.category.id : '';
        const shortMsg = (m.shortMessage || '').toLowerCase();

        // Pure spelling mistakes -> RED squiggly line
        if (catId === 'TYPOS' || shortMsg === 'spelling mistake' || (m.rule.id && m.rule.id.startsWith('MORFOLOGIK_'))) {
            return 'spelling';
        }

        // Grammar, contextual spelling (CONFUSED_WORDS), casing (CASING),
        // typography (TYPOGRAPHY), punctuation, repetition, style -> GREEN squiggly line
        return 'grammar';
    }

    /**
     * Applies original word casing (lowercase, capitalized, or all-caps) to a suggestion.
     */
    function applyCasing(str, isAllUpper, isCapitalized) {
        if (!str) return str;
        if (isAllUpper) return str.toUpperCase();
        if (isCapitalized) return str.charAt(0).toUpperCase() + str.slice(1);
        return str;
    }

    /**
     * Generates intelligent, context-aware spelling suggestions using phonetic patterns,
     * Damerau-Levenshtein distance, and common frequency weighting.
     */
    function getSuggestions(rawWord) {
        if (!rawWord) return [];
        const isAllUpper = (rawWord === rawWord.toUpperCase() && rawWord.length > 1);
        const isCapitalized = (!isAllUpper && rawWord.charAt(0) === rawWord.charAt(0).toUpperCase());

        const word = rawWord.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        if (!word || word.length < 2) return [];

        if (_suggestionsMap.has(word)) {
            return _suggestionsMap.get(word).map(w => applyCasing(w, isAllUpper, isCapitalized));
        }

        if (!window.OPUB_DICTIONARY) return [];

        const candidates = new Map(); // candidate -> score

        function addCandidate(cand, baseScore) {
            if (!cand || cand === word) return;
            if (!window.OPUB_DICTIONARY?.has(cand) && !_knownGoodWords.has(cand)) return;

            let score = baseScore;
            // Frequency rank bonus (Google / SCOWL top common words)
            if (window.OPUB_COMMON_MAP && window.OPUB_COMMON_MAP.has(cand)) {
                const rank = window.OPUB_COMMON_MAP.get(cand);
                score += Math.max(0, 50 - (rank / 400));
            }
            // Same first letter bonus
            if (cand[0] === word[0]) score += 15;
            // Length proximity penalty
            score -= Math.abs(cand.length - word.length) * 4;

            if (!candidates.has(cand) || candidates.get(cand) < score) {
                candidates.set(cand, score);
            }
        }

        // 1. Phonetic transformations (high priority)
        for (let i = 0; i < PHONETIC_RULES.length; i++) {
            const [from, to] = PHONETIC_RULES[i];
            if (word.includes(from)) {
                const cand = word.replace(from, to);
                addCandidate(cand, 100);
            }
        }

        // 2. Damerau-Levenshtein Edit Distance 1
        const len = word.length;
        // Deletions
        for (let i = 0; i < len; i++) {
            addCandidate(word.slice(0, i) + word.slice(i + 1), 85);
        }
        // Transpositions
        for (let i = 0; i < len - 1; i++) {
            if (word[i] !== word[i + 1]) {
                addCandidate(word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2), 90);
            }
        }
        // Replacements
        for (let i = 0; i < len; i++) {
            const prefix = word.slice(0, i);
            const suffix = word.slice(i + 1);
            for (let j = 0; j < 26; j++) {
                const ch = ALPHABET[j];
                if (ch !== word[i]) {
                    addCandidate(prefix + ch + suffix, 80);
                }
            }
        }
        // Insertions
        for (let i = 0; i <= len; i++) {
            const prefix = word.slice(0, i);
            const suffix = word.slice(i);
            for (let j = 0; j < 26; j++) {
                addCandidate(prefix + ALPHABET[j] + suffix, 80);
            }
        }

        // 3. Edit Distance 2 if fewer than 4 candidates
        if (candidates.size < 4 && len <= 12) {
            const e1List = [];
            for (let i = 0; i < len; i++) e1List.push(word.slice(0, i) + word.slice(i + 1));
            for (let i = 0; i < len - 1; i++) e1List.push(word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2));
            for (let i = 0; i < len; i++) {
                for (let j = 0; j < 26; j += 2) e1List.push(word.slice(0, i) + ALPHABET[j] + word.slice(i + 1));
            }

            for (let k = 0; k < e1List.length; k++) {
                const e1 = e1List[k];
                if (e1.length < 3) continue;
                const e1Len = e1.length;
                for (let i = 0; i < e1Len; i++) {
                    const c2 = e1.slice(0, i) + e1.slice(i + 1);
                    if (window.OPUB_COMMON_MAP && window.OPUB_COMMON_MAP.has(c2)) addCandidate(c2, 45);
                }
                for (let i = 0; i < e1Len - 1; i++) {
                    const c2 = e1.slice(0, i) + e1[i + 1] + e1[i] + e1.slice(i + 2);
                    if (window.OPUB_COMMON_MAP && window.OPUB_COMMON_MAP.has(c2)) addCandidate(c2, 50);
                }
                for (let i = 0; i < e1Len; i++) {
                    for (let j = 0; j < 26; j += 3) {
                        const c2 = e1.slice(0, i) + ALPHABET[j] + e1.slice(i + 1);
                        if (window.OPUB_COMMON_MAP && window.OPUB_COMMON_MAP.has(c2)) addCandidate(c2, 40);
                    }
                }
                if (candidates.size >= 10) break;
            }
        }

        const sorted = Array.from(candidates.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);

        const result = sorted.slice(0, 5).map(s => applyCasing(s, isAllUpper, isCapitalized));
        _suggestionsMap.set(word, result);
        return result;
    }

    /**
     * Paints both red (spelling) and green (grammar) squiggly underlines.
     * Uses direct text-node token scanning so spelling error ranges NEVER drift,
     * never underline half-words, and never span across block elements.
     */
    function paintHighlights() {
        if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;

        if (typeof state !== 'undefined' && state.spellCheck === false) {
            try { CSS.highlights.delete('spelling-error'); } catch(e) {}
            try { CSS.highlights.delete('grammar-error'); } catch(e) {}
            return;
        }

        const grammarEnabled = isGrammarEnabled();
        if (!grammarEnabled) {
            try { CSS.highlights.delete('grammar-error'); } catch(e) {}
        }

        const paper = document.getElementById('paper');
        if (!paper) return;

        const editables = paper.querySelectorAll('.pub-element [contenteditable="true"], [contenteditable="true"]');
        const spellingRanges = [];
        const grammarRanges = [];

        editables.forEach(editable => {
            if (editable.classList.contains('wa-text') || editable.getAttribute('data-spellcheck') === 'false') {
                return;
            }

            // 1. Direct text node token scanning for spelling errors
            // Walks DOM text nodes directly; attaches Range strictly to (textNode, match.index, match.index + len)
            const walker = document.createTreeWalker(editable, NodeFilter.SHOW_TEXT);
            let textNode;

            while ((textNode = walker.nextNode())) {
                const text = textNode.textContent;
                if (!text || !text.trim()) continue;

                WORD_REGEX.lastIndex = 0;
                let match;
                while ((match = WORD_REGEX.exec(text)) !== null) {
                    const rawWord = match[0];
                    if (!isCheckableWord(rawWord)) continue;

                    if (isWordMisspelled(rawWord)) {
                        try {
                            const range = new Range();
                            range.setStart(textNode, match.index);
                            range.setEnd(textNode, match.index + rawWord.length);
                            spellingRanges.push(range);
                        } catch(err) {}
                    }
                }
            }

            // 2. Grammar matches from local rules and background proofing (if enabled)
            if (grammarEnabled) {
                const rootEditable = (editable.closest ? (editable.closest('[contenteditable="true"]') || editable) : editable);
                const localMatches = scanLocalGrammarRules(rootEditable);
                const cached = _editableCache.get(rootEditable);
                const remoteMatches = (cached && cached.remoteGrammarMatches) ? cached.remoteGrammarMatches : [];
                const allMatches = mergeGrammarMatches(localMatches, remoteMatches);

                _editableCache.set(rootEditable, {
                    text: rootEditable.innerText || '',
                    grammarMatches: allMatches,
                    remoteGrammarMatches: remoteMatches
                });

                allMatches.forEach(m => {
                    if (m.ruleId && _ignoredRulesSet.has(m.ruleId)) return;
                    if (m.range && m.range.startContainer && m.range.startContainer.isConnected) {
                        grammarRanges.push(m.range);
                    } else {
                        const range = createRangeForOffsets(rootEditable, m.offset, m.length, m.text);
                        if (range) {
                            m.range = range;
                            grammarRanges.push(range);
                        }
                    }
                });
            }
        });

        // Register highlights in CSS.highlights
        try {
            if (spellingRanges.length > 0) {
                CSS.highlights.set('spelling-error', new Highlight(...spellingRanges));
            } else {
                CSS.highlights.delete('spelling-error');
            }

            if (grammarEnabled && grammarRanges.length > 0) {
                CSS.highlights.set('grammar-error', new Highlight(...grammarRanges));
            } else {
                CSS.highlights.delete('grammar-error');
            }
        } catch(e) {
            console.warn('ProofingEngine Highlight error:', e);
        }
    }

    /**
     * Checks an editable element with LanguageTool for grammar, punctuation, and style rules
     */
    function checkEditableWithLanguageTool(editable) {
        if (!editable) return;
        if (typeof state !== 'undefined' && state.spellCheck === false) return;
        if (!isGrammarEnabled()) return;
        if (editable.classList.contains('wa-text') || editable.getAttribute('data-spellcheck') === 'false') return;

        const rootEditable = (editable.closest ? (editable.closest('[contenteditable="true"]') || editable) : editable);
        const text = rootEditable.innerText || '';
        if (!text || text.trim() === '') {
            _editableCache.delete(rootEditable);
            paintHighlights();
            return;
        }

        const cached = _editableCache.get(rootEditable);
        if (cached && cached.text === text) {
            paintHighlights();
            return;
        }

        const savedLang = localStorage.getItem('opub_proofing_lang');
        const userLang = savedLang || ((typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('en'))
            ? (navigator.language.toLowerCase() === 'en-gb' ? 'en-GB' : 'en-US')
            : 'en-US');

        if (localStorage.getItem('opub_online_proofing_enabled') === 'false') {
            paintHighlights();
            return;
        }

        if (_activeFetches.has(rootEditable)) {
            try { _activeFetches.get(rootEditable).abort(); } catch(e) {}
        }
        const abortCtrl = new AbortController();
        _activeFetches.set(rootEditable, abortCtrl);

        fetch('https://api.languagetool.org/v2/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `language=${userLang}&text=${encodeURIComponent(text)}`,
            signal: abortCtrl.signal
        })
        .then(res => res.json())
        .then(data => {
            _activeFetches.delete(rootEditable);
            const grammarMatches = [];

            if (data.matches && Array.isArray(data.matches)) {
                data.matches.forEach(m => {
                    let matchOffset = m.offset;
                    let matchLength = m.length;
                    let matchedStr = text.substring(matchOffset, matchOffset + matchLength);

                    // Skip matches that are only whitespace (e.g. WHITESPACE_RULE flagging double spaces)
                    // Highlighting whitespace creates detached squiggles that clip or float awkwardly
                    if (matchedStr.trim().length === 0) return;

                    const classification = classifyMatch(m);
                    const ruleId = (m.rule && m.rule.id) ? m.rule.id : '';
                    let replacements = (m.replacements && Array.isArray(m.replacements))
                        ? m.replacements.map(r => r.value)
                        : [];

                    // LanguageTool tokenizes contractions like "it's" as "it" and "'s".
                    // If the match only covers the start of a contraction (e.g. UPPERCASE_SENTENCE_START flagging "it"),
                    // expand matchLength and replacements to cover the full contraction so the entire word is highlighted and replaced properly.
                    const restOfWordMatch = text.substring(matchOffset + matchLength).match(/^(['’][A-Za-z]+)/);
                    if (restOfWordMatch && (ruleId === 'UPPERCASE_SENTENCE_START' || (m.rule && m.rule.category && m.rule.category.id === 'CASING'))) {
                        const suffix = restOfWordMatch[1];
                        matchLength += suffix.length;
                        matchedStr += suffix;
                        replacements = replacements.map(r => r + suffix);
                    }

                    // LanguageTool is used exclusively for grammar, repetition, punctuation, and style
                    // Spelling is 100% managed by our comprehensive offline dictionary
                    if (classification !== 'spelling' && !_ignoredRulesSet.has(ruleId)) {
                        grammarMatches.push({
                            offset: matchOffset,
                            length: matchLength,
                            text: matchedStr,
                            ruleId: ruleId,
                            catId: (m.rule && m.rule.category) ? m.rule.category.id : '',
                            message: m.message,
                            shortMessage: m.shortMessage,
                            replacements: replacements
                        });
                    }
                });
            }

            const localMatches = scanLocalGrammarRules(rootEditable);
            const allMatches = mergeGrammarMatches(localMatches, grammarMatches);
            _editableCache.set(rootEditable, {
                text: text,
                grammarMatches: allMatches,
                remoteGrammarMatches: grammarMatches
            });

            paintHighlights();
        })
        .catch(err => {
            _activeFetches.delete(rootEditable);
            if (err.name !== 'AbortError') {
                console.warn('LanguageTool proofing fetch failed:', err);
            }
        });
    }

    /**
     * Scans and verifies visible editable elements immediately
     */
    function run() {
        if (typeof state !== 'undefined' && state.spellCheck === false) {
            if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
                try { CSS.highlights.delete('spelling-error'); } catch(e) {}
                try { CSS.highlights.delete('grammar-error'); } catch(e) {}
            }
            return;
        }

        // 1. Immediately paint highlights from local dictionary
        paintHighlights();

        // 2. If grammar check is enabled, query LanguageTool in background
        if (isGrammarEnabled()) {
            const paper = document.getElementById('paper');
            if (!paper) return;

            const editables = paper.querySelectorAll('.pub-element [contenteditable="true"], [contenteditable="true"]');
            editables.forEach(editable => {
                checkEditableWithLanguageTool(editable);
            });
        }
    }

    function triggerDebounced(delay = 250) {
        if (_debounceTimer) clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(run, delay);
    }

    /**
     * Adds a word to the user custom dictionary
     */
    function addToDictionary(word) {
        if (!word) return;
        const clean = word.toLowerCase().trim();
        _customDictSet.add(clean);
        _knownBadWords.delete(clean);
        _knownGoodWords.add(clean);
        try {
            localStorage.setItem('opub_custom_dictionary', JSON.stringify(Array.from(_customDictSet)));
        } catch(e) {}
        paintHighlights();
    }

    /**
     * Ignores a word for the current session
     */
    function ignoreWord(word) {
        if (!word) return;
        const clean = word.toLowerCase().trim();
        _ignoredWordsSet.add(clean);
        _knownBadWords.delete(clean);
        _knownGoodWords.add(clean);
        try {
            localStorage.setItem('opub_ignored_words', JSON.stringify(Array.from(_ignoredWordsSet)));
        } catch(e) {}
        paintHighlights();
    }

    /**
     * Ignores a grammar rule for current user/session
     */
    function ignoreGrammarRule(ruleId) {
        if (!ruleId) return;
        _ignoredRulesSet.add(ruleId);
        try {
            localStorage.setItem('opub_ignored_grammar_rules', JSON.stringify(Array.from(_ignoredRulesSet)));
        } catch(e) {}

        _editableCache.forEach(cached => {
            if (cached.grammarMatches) {
                cached.grammarMatches = cached.grammarMatches.filter(m => m.ruleId !== ruleId);
            }
        });

        paintHighlights();
    }

    /**
     * Registers a known bad word directly
     */
    function recordMisspelledWord(word, suggestions = []) {
        if (!word) return;
        const clean = word.toLowerCase().trim();
        if (isCheckableWord(clean)) {
            _knownBadWords.add(clean);
            if (suggestions.length > 0) {
                _suggestionsMap.set(clean, suggestions);
            }
            paintHighlights();
        }
    }

    /**
     * Retrieves any active proofing issue (grammar or spelling) at the given editable/word/range.
     * Supports both word ranges and collapsed caret point ranges.
     */
    function getIssueAt(editable, word, wordRange, pointRange) {
        const cleanWord = (word || '').toLowerCase().replace(/^[^a-z]+|[^a-z]+$/gi, '');
        let rootEditable = editable ? (editable.closest ? (editable.closest('[contenteditable="true"]') || editable) : editable) : null;
        if (!rootEditable && wordRange && wordRange.startContainer) {
            const sc = wordRange.startContainer;
            rootEditable = sc.nodeType === 1 ? sc.closest('[contenteditable="true"]') : sc.parentElement?.closest('[contenteditable="true"]');
        }
        if (!rootEditable && pointRange && pointRange.startContainer) {
            const sc = pointRange.startContainer;
            rootEditable = sc.nodeType === 1 ? sc.closest('[contenteditable="true"]') : sc.parentElement?.closest('[contenteditable="true"]');
        }
        if (!rootEditable && typeof state !== 'undefined' && state.selectedEl) {
            rootEditable = state.selectedEl.isContentEditable ? state.selectedEl : (state.selectedEl.querySelector ? state.selectedEl.querySelector('[contenteditable="true"]') : null);
        }

        // 1. Check grammar issues first
        if (isGrammarEnabled()) {
            if (rootEditable && !_editableCache.has(rootEditable)) {
                const localMatches = scanLocalGrammarRules(rootEditable);
                _editableCache.set(rootEditable, {
                    text: rootEditable.innerText || '',
                    grammarMatches: localMatches,
                    remoteGrammarMatches: []
                });
            }
            const candidateCaches = [];
            if (rootEditable && _editableCache.has(rootEditable)) {
                candidateCaches.push({ ed: rootEditable, cache: _editableCache.get(rootEditable) });
            } else {
                for (const [ed, c] of _editableCache.entries()) {
                    candidateCaches.push({ ed, cache: c });
                }
            }

            for (const { ed, cache } of candidateCaches) {
                if (!cache || !cache.grammarMatches || cache.grammarMatches.length === 0) continue;
                for (const gm of cache.grammarMatches) {
                    if (gm.ruleId && _ignoredRulesSet.has(gm.ruleId)) continue;
                    // Re-create range if missing, or if text nodes were mutated and detached the range
                    if ((!gm.range || !gm.range.startContainer || !gm.range.startContainer.isConnected) && ed) {
                        gm.range = createRangeForOffsets(ed, gm.offset, gm.length, gm.text);
                    }
                    if (!gm.range) continue;

                    let matches = false;
                    const testRange = wordRange || pointRange;
                    if (testRange && gm.range) {
                        try {
                            const endsAfterStart = testRange.compareBoundaryPoints(Range.END_TO_START, gm.range) > 0;
                            const startsBeforeEnd = testRange.compareBoundaryPoints(Range.START_TO_END, gm.range) < 0;
                            if (endsAfterStart && startsBeforeEnd) {
                                matches = true;
                            }
                        } catch(e) {}
                    }

                    if (!matches && pointRange && gm.range) {
                        try {
                            const afterStart = pointRange.compareBoundaryPoints(Range.START_TO_START, gm.range) >= 0;
                            const beforeEnd = pointRange.compareBoundaryPoints(Range.END_TO_END, gm.range) <= 0;
                            if (afterStart && beforeEnd) {
                                matches = true;
                            }
                        } catch(e) {}
                    }

                    const gmText = (gm.text || '').toLowerCase().trim();
                    if (!matches && cleanWord) {
                        const gmTokens = gmText.split(/[^a-z0-9'’]+/).filter(Boolean);
                        const cleanNorm = cleanWord.replace(/’/g, "'");
                        const cleanNoApos = cleanNorm.replace(/'/g, '');
                        const allTokens = [...gmTokens, ...gmTokens.map(t => t.replace(/['’]/g, ''))];
                        if (gmText === cleanNorm || gmText === cleanNoApos ||
                            allTokens.some(t => t === cleanNorm || t === cleanNoApos)) {
                            matches = true;
                        }
                    }

                    if (matches) {
                        return {
                            type: 'grammar',
                            ruleId: gm.ruleId,
                            message: gm.message,
                            shortMessage: gm.shortMessage,
                            text: gm.text,
                            replacements: gm.replacements || [],
                            range: gm.range || testRange
                        };
                    }
                }
            }
        }

        // 2. Check spelling issues
        if (word && isWordMisspelled(word)) {
            return {
                type: 'spelling',
                word: word,
                replacements: getSuggestions(word),
                range: wordRange
            };
        }

        return null;
    }

    const DEFAULT_AUTOCORRECT = {
        '(c)': '©',
        '(r)': '®',
        '(tm)': '™',
        '(p)': '§',
        '-->': '→',
        '<--': '←',
        '<->': '↔',
        '==>': '⇒',
        '<==': '⇐',
        '<=>': '⇔',
        '1/2': '½',
        '1/4': '¼',
        '3/4': '¾',
        '+-': '±',
        ':)': '😊',
        ':(': '🙁',
        ';)': '😉'
    };

    function getAutoCorrectMap() {
        try {
            const saved = localStorage.getItem('opub_custom_autocorrect');
            if (saved) {
                const custom = JSON.parse(saved);
                return Object.assign({}, DEFAULT_AUTOCORRECT, custom);
            }
        } catch(e) {}
        return Object.assign({}, DEFAULT_AUTOCORRECT);
    }

    function applyAutoCorrect(editable) {
        if (!editable || localStorage.getItem('opub_autocorrect_enabled') === 'false') return;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;

        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        if (!node || node.nodeType !== Node.TEXT_NODE) return;

        const textBefore = node.textContent.substring(0, range.startOffset);
        const acMap = getAutoCorrectMap();

        for (const shortcut in acMap) {
            if (textBefore.endsWith(shortcut)) {
                const repl = acMap[shortcut];
                const startPos = range.startOffset - shortcut.length;
                node.textContent = node.textContent.substring(0, startPos) + repl + node.textContent.substring(range.startOffset);
                const newRange = document.createRange();
                newRange.setStart(node, startPos + repl.length);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
                break;
            }
        }
    }

    function init() {
        document.addEventListener('input', function(e) {
            if (e.target && e.target.isContentEditable) {
                triggerDebounced(250);
            }
        }, true);

        document.addEventListener('keydown', function(e) {
            if ((e.key === ' ' || e.key === 'Enter') && e.target && e.target.isContentEditable) {
                applyAutoCorrect(e.target);
            }
        }, true);

        document.addEventListener('selectionchange', function() {
            if (document.activeElement && document.activeElement.isContentEditable) {
                triggerDebounced(300);
            }
        });

        window.addEventListener('mouseup', function() {
            triggerDebounced(150);
        });

        setTimeout(run, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.SpellCheckEngine = {
        run: run,
        trigger: triggerDebounced,
        isWordMisspelled: isWordMisspelled,
        isWordInDictionary: isWordInDictionary,
        isGrammarEnabled: isGrammarEnabled,
        setGrammarEnabled: function(val) {
            if (typeof state !== 'undefined') state.grammarCheck = !!val;
            localStorage.setItem('opub_grammarcheck', val ? 'true' : 'false');
            paintHighlights();
        },
        getCustomDictionary: function() {
            return Array.from(_customDictSet);
        },
        removeFromDictionary: function(word) {
            if (!word) return;
            const clean = word.toLowerCase().trim();
            _customDictSet.delete(clean);
            try {
                localStorage.setItem('opub_custom_dictionary', JSON.stringify(Array.from(_customDictSet)));
            } catch(e) {}
            _knownBadWords.add(clean);
            _knownGoodWords.delete(clean);
            run();
        },
        resetIgnoredRules: function() {
            _ignoredRulesSet.clear();
            _ignoredWordsSet.clear();
            try {
                localStorage.removeItem('opub_ignored_grammar_rules');
                localStorage.removeItem('opub_ignored_words');
            } catch(e) {}
            run();
        },
        getAutoCorrectMap: getAutoCorrectMap,
        addAutoCorrectRule: function(shortcut, replacement) {
            if (!shortcut || !replacement) return;
            try {
                const custom = JSON.parse(localStorage.getItem('opub_custom_autocorrect') || '{}');
                custom[shortcut] = replacement;
                localStorage.setItem('opub_custom_autocorrect', JSON.stringify(custom));
            } catch(e) {}
        },
        removeAutoCorrectRule: function(shortcut) {
            if (!shortcut) return;
            try {
                const custom = JSON.parse(localStorage.getItem('opub_custom_autocorrect') || '{}');
                delete custom[shortcut];
                localStorage.setItem('opub_custom_autocorrect', JSON.stringify(custom));
            } catch(e) {}
        },
        resetAutoCorrect: function() {
            try {
                localStorage.removeItem('opub_custom_autocorrect');
            } catch(e) {}
        },
        getSuggestions: getSuggestions,
        getIssueAt: getIssueAt,
        createRangeForOffsets: createRangeForOffsets,
        addToDictionary: addToDictionary,
        ignoreWord: ignoreWord,
        ignoreGrammarRule: ignoreGrammarRule,
        recordMisspelledWord: recordMisspelledWord,
        paintHighlights: paintHighlights
    };

    // Provide proofing alias
    window.ProofingEngine = window.SpellCheckEngine;

})();
