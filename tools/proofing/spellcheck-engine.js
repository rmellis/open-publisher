/**
 * OpenPublisher Professional Proofing & Grammar Engine (v5.20.5)
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
    const _builtinGoodWords = "a aaa aaas aaron aarons aaronses abbie abbies abbotsford abby abbys abercrombie aberdare aberdeen aberdeenshire aberford abhyanga abhyangas abigail abigails abudhabi abuela abuelas abuelases abuelo abuelos abueloses abuja ac aca acas accra accrington ackworth acls acomb acs adalynn adalynns adam adams adamses addingham adel adelaide adeline adelines adipiscing adipiscings adm admiral admirals adms adrian adrians adv advent advents advocate advocates advs adwick aeg aegean aegeans africa agentic agentics agua aguas aidan aidans aiden aidens aileen aileens aimee aimees airbnb airdrie airedale aisle aisles aisling aislings aka akron al alabama alan alans alaska albania albert alberta alberts albertsons albie albies albuquerque albury alby albys alc alcs alderman aldermanship aldermen aldi aldis alex alexander alexanders alexandra alexandras alexchen alexchens alexrivera alexriveras alexs alf alfie alfies alfred alfreds alfredses alfs alfses algiers ali alice alices alicia alicias alina alinas aliqua aliquas aliquip aliquips alis alistair alistairs alla allan allans allas alle allen allens allerton alles alloa alnwick alphalete als altar altars altrincham alun aluns alvarez alvarezs alwoodley alyssa alyssas amalfi amalfis amann amanns amaro amaros amazon amber ambers amelia amelias amelie amelies american americano americanos americans americas amet amets amir amirs amman amsterdam amy amys amyses anaheim anastasia anastasias anc anchorage ancs anderson andersons andrea andreas andrew andrews andrewses andy andys andyses angel angela angelas angeles angels angie angies anglesey angus anim anims ankara anlaby anston antarctica anthony anthonys antoine antoines anton antons antrim aoife aoifes ap apac apacs apendleton apendletons aperitivo aperitivos aperol aperols apexathlete apexathletes apexglobal apexglobals apexmedical apexmedicals apexscholars apexstadium apexstadiums apexstrategy apexstrategys apexventures api apis app apple applewood applewoods apps apr april aprils aprs aps aquafaba aquafabas arabella arabellas arancini arancinis arbroath archbishop archbishops archdeacon archdeacons archie archies arcu arcus ardsley argos argyll aria arias arizona arkansas arlington arlo arlos armagh armani armenia armley armstrong armstrongs armthorpe aron arons aronses arr arron arrons arronses arrs arthur arthurs arwel arwels arya aryas asada asadas asadors ascender ascenders asda asdas ash asher ashers ashes ashford ashington ashs ashton asia askern asos aston astor astorcelebrations astoria astorianye astorianyes astorias astors asuncion async asyncs atelierlumiere atelierlumieres athena athenas athens athlone atlanta atlantic atlantics attorney attorneys atty attys au aubrey aubreys auchan auckland audrey audreys aug aughton augs august augusts auntie aunties aunty auntys auraboutique auraboutiques auradesign auradesigns aurora auroras aus austin austins austria aute autentica autenticas autes auth auths autocad autocads autocorrect autumn autumns ava avas avatars avenure avenures avery averys avg avgs aws axel axels ayatollah ayatollahs ayr ayrshire az azerbaijan azimut azimuts azs azurecliffsresort azurecliffsresorts azureyachts babysboutique babysboutiques bachelorette bachelorettes badsworth bae baes baffin baffins baghdad baildon bailey baileys baker bakers bakersfield baku balbriggan balby balenciaga bali balis ball ballarat balls ballyclare ballymena ballymoney baltimore banbridge banffshire bangalore bangkok bangor banh banhs banquet banquets banquetses barbara barbaras barbour barcelona barcelonas bardsey barker barkers barlby barnes barnsley baron baroness baronesses barons barrie barrister barristers barrow barry barrys bartlett bartletts barughgreen barwick basildon basingstoke batemoor bates bath bathgate batley batonrouge bauhaus baumann baumanns bawtry baz bazs bbq bbqs bc bcs bday bdays bearer bearers bearerses bearsden beatrice beatrices beau beaus bebas beckett becketts becky beckys bedale bedford bedfordshire beeston begum begums behance behances beighton beijing beirut beko belarus belfast belgian belgians belgium belgrade bell bella bellas bellases belleisle bellini bellinis bells ben bendigo benjamin benjamins bennett bennetts benny bennys bens bentley bentleys bentleyses bently bentlys bentlyses berber berbers berkshire berlin bern bernadette bernadettes berry berrys bershka berwick berwickshire bessacarr bestie besties bestman bestmans bestmanses bestmen bestmens beth bethan bethans bethany bethanys beths beverley beverleys beverly beverlys bf bff bffs bffses bfs bianche bianches biannual biannually biannuallys biannuals bicentennial bicentennials bigquery bigquerys billingham billings billy billys bimonthly bimonthlys bingley bio biohacking biohackings bios birkenhead birmingham birria birrias birstall bishop bishops bishopthorpe bitcoin biweekly biweeklys blackburn blackpool blaenaugwent blake blakes blanc blancs bleu bleus blitzen blitzens blvd blvds blyth bobby bobbys bodmin bodyshop bogota boise bolton bonbonniere bonbonnieres bonnie bonnies boohoo booker booth booths bootle boots bosch bosco boscos bose bosnia boston bostonspa bottura botturas boucl boucls bouquet bouquets bouquetses bournemouth boutonniere boutonnieres boyd boyds br bradford bradley bradleys bramham bramhope bramley brandon brandons brant brants brantses branwen branwens brasilia bratislava bray brayton bre breathwork breathworks breitling brenda brendan brendans brendas brentwood bres bretton brian brianna briannas brians bride bridegroom bridegrooms bridegroomses brides bridesmaid bridesmaids bridesmaidses bridesman bridesmans bridesmen bridesmens bridgend bridlington brierley brigadier brigadiers brighouse brighton brightsmile brightsmiles brinsworth brisbane bristol britishcolumbia bro brody brodys bronagh bronaghs bronte brontes brooke brookes brooklyn brooklyns brooks broome broomes broomhill bros brotherinlaw brotherinlaws brotherton brough brown browns bruce bruces brussels bryan bryans bryn bryns bsn bsns btw buchanan buchanans bucharest buckinghamshire bucksparty buckspartys budapest budgens buenosaires buffalo bugfix bugfixes bulgaria bunbury bundaberg bunnings burberry burgerking burley burmantofts burngreave burnley burns burnses burrata burratas burton bury bute butler butlers buttershaw byram bywater ca cac cachebuster cachebusters cacio cacios cacs cadet cadets caerphilly caf caffe cafs cairns cairo caithness calabrian calabrians calacatta calacattas caleb calebs calgary california calligrapher calligraphers calligrapherses calligraphy calligraphys callum callums calvin calvinklein calvins cam cambridge cambridgeshire cambuslang cameron camerons camila camilas camille camilles campari camparis campbell campbells camppinecrest camppinecrests cams canberra candy cannes cannock canon canons canterbury cantley caoimhe caoimhes capetown capricciosa capricciosas capt captain captains capts caracas carcroft cardiff cardinal cardinals carl carlisle carlow carls carlton carly carlys carmarthen carmarthenshire carne carnes carol carole carolers caroles carolina carolinas caroling carolings carols carolyn carolyns carpathian carpathians carr carrefour carrickfergus carrs carson carsons carter carters cartier carwyn carwyns carys caryses cas casablanca casaterra casaterras cascadia cascadiaconservancy cascadiaconservancys cascadias cashback casio castillo castillos castleford castlereagh castore catcliffe cateringprivate cateringprivates catrin catrins catriona catrionas catterick cavatappi cavatappis cawood cc ccrn ccrns ccs celeb celebrant celebrants celebrantses celebs centerpiece centerpieces ceo ceos ceredigion ceremonies ceremony ceremonys cerys ceryses cet cets ceylon ceylons chambershale chambershales championscamp championscamps chancellor chancellors chandler chanel chanukah chanukahs chapelallerton chapeltown chaplain chaplains chapman chapmans charles charleston charlie charlies charlotte charlottes chatham chavez chavezs chebbi chebbis chelmsford chelsea chelseas cheltenham chemex chemexs chemistwarehouse chen chennai chens cherrywood cherrywoods cheryl cheryls chesapeake cheshire chester chiat chiats chicago chief chiefs chilean chileans chinatown chinatowns chisinau chloe chloes chocolat chocolats chorley chris chrises chriss chrisses chrissy chrissys chrissyses christchurch christian christians christie christies christmas christmases christmastime christmastimes christopher christophers christopherses chulavista chuppah chuppahs chuppahses churwell cian cians ciara ciaran ciarans ciaras cillian cillians cillum cillums cincinnati cinzel cinzels citizen citybookfair citybookfairs clackmannanshire claire claires clapham clara claras clare clares clark clarke clarkes clarks classof classofs claudia claudias claus clayton claytonwest cleckheaton cleveland cliff cliffe clifford cliffords cliffs cliffside cliffsides clipart clive clives cllr cllrs clo clodagh clodaghs clos cloudbase cloudbases cloudflare cloudflares cloudnet cloudnets clwyd clydebank cmdr cmdrs cmf cmfs cmo cmos cmyk cnc cncs co coatbridge coffsharbour col colchester cole coleraine coles colette colettes colin colins collingham collins collinses colombia colombias colombo colonel colonels colorado coloradosprings cols colton coltons columbia columbias columbus colwynbay com comber comet commander commanders commodo commodore commodores commodos coms confetti confettis congleton congrats congressman congressmen congresswoman congresswomen conisbrough connecticut connor connors conor conors consectetur consecteturs consequat consequats consomm consomms const constable constables consts contactless converse conwy cook cookridge cooks cookstown coop cooper coopers copenhagen copmanthorpe cora coras corby cork cornell cornells cornwall corp corporal corporals corps corpuschristi corsage corsages cortado cortados cos costa costco costcos costcutter costcutters cottingham cotto cottos councillor councillors counsel counsels count countess countesses counts courtney courtneys coventry cox coxs cpa cpas cpl cpls craig craigavon craigs cramlington crawford crawfords crawley creativestudio creativestudios creatorgear creatorgears crema cremas crewclothing crewe crigglestone crm crms croatia crofton crookes croque croques crosby crosbys crossflatts crossgates crosshills cruz cruzs cryo cryos crypto cryptos csm csms cto ctos ctr ctrl ctrls ctrs cuda cudas cudworth cullingworth culpa culpas cum cumbernauld cumbria cums cunningham cunninghams cupidatat cupidatats curate curates currys cv cvs cwmbran cybersecurity cycladic cycladics cyprus czechia dad dads dadses dafydd dafydds daiginjo daiginjos daisy daisys dale dales dallas damascus dame dames dan dancer dancers daniel danielle danielles daniels danny dannys dans darcie darcies darcy darcys daria darias darkmode darlington darnall darragh darraghs dartford darton darwin dasher dashers datacorp datacorps datasets datatech datatechs dave daves davey daveys daveyses david davids davidses davies davis davises davy davys davyses dawn dawns dawson dawsons dc dcs dds deacon deaconess deaconesses deacons deal dean deans dearbhla dearbhlas dearne debbie debbies debenhams deborah deborahs dec decathlon december decembers declan declans decs deepcar delaware delhaize delhi delilah delilahs deliverables deliveroo deloitte deloittes delonghi delyth delyths demi demis denbighshire denbydale denholme denise denises denmark dennis dennises denver depop deputies deputy derby derbyshire derek dereks derry descender descenders deserunt deserunts desmoines det detective detectives detroit dets devcon devconhorizon devconhorizons devcons devmail devmails devon devops dewalt dewalts dewsbury dexa dexas dfm dfms dhaka dialogs diane dianes diavola diavolas diaz diazs dinnington dior diplome diplomes dir dirs discord diwali diwalis dixon dixons diy dj dji djs dm dms doc docent docents docmartens docs dodworth doha doja dojas dolla dollas dolor dolore dolores dolors dom dominic dominics dominos don dona donaghadee doncaster donna donnas doorbuster doorbusters dore doreen doreens dorothy dorothys dorset dot dots douglas dover down downpatrick dpi dr dreidel dreidels dremel dremels dri driffield dris drogheda dropcap dropcaps dropdowns drs drsarahchen drsarahchens drumlines du dua duas dubai dubbo dublin duchess duchesses duis duke dukes dumbarton dumfries dumfriesshire dunbartonshire dundalk dundee dunedin dunelm dungannon dunnington dunscroft durban durham dus dyfed dylan dylans dyson eagle earl earls earthocean earthoceans easington eastbourne eastburn easter easters eastex eastkilbride easton eastons eastriding ebay ebitda ebitdas eccles ecclesfield eccleshill ecmo ecmos ed eddie eddies edeka edie edies edinburgh edlington edmonton eds edtech edu edus edward edwards edwardses ehr ehrs eid eids eileen eileens eilidh eilidhs eimear eimears eira eiras eiusmod eiusmods elder elders eleanor eleanors eleiko eleikos elena elenarossi elenarossis elenarostova elenarostovas elenas eleri eleris elevatefitness elf elfs elgan elgans elgin eli elias elijah elijahs eliot eliots elis elit elits eliza elizabeth elizabeths elizas ella elland ellas ellesmereport ellie ellies elliot elliots elliott elliotts ellis ellises elpaso elves elysee elysees emcee emcees emea emeas emer emers emilia emilian emiliana emilianas emiliano emilianos emilians emilias emily emilys emley emma emmas emojis england enim enims ennis enniskillen enzo enzos epubs equinox equinoxes equinoxs erat erats eric erics erostova erostovas erp erps ertificate ertificates esme esmes espadin espadins esports esq esqs esquire esquires essex estonia eta ethan ethans ethereum ethiopia ethiopias etsy eu eugene eugenes euler europe european europeans eus eva evans evanses evas evelyn evelyns everett everetts excellencies excellency excepteur excepteurs executiveboard executiveboards exercitation exercitations exeter exup exups ezra ezras fab facs fagd fagds fairburn faith faiths falkirk falmouth fam fams famses faq faqs farmfoods farnley farsley fatface father fatherinlaw fatherinlaws fathers fave faves fb featherstone feb february februarys febs felix felixs fellow fellows fendi fenwick ferguson fergusons fermanagh ferris ferrybridge ffion ffions fi fiance fiancee fiancees fiances fifeshire figma figmas filey fillmore fillmores filmfest filmfests finland finley finleys finn finnian finnians finningley finns fintech fiona fionas fior fiors fira firas firvale fis fitzwilliam fl fleming flemings fletcher fletchers fleur fleurs flintshire flockton florence florences flores florida flowergirl flowergirls flowergirlses fls flynn flynns folkestone fontfamily foodie foodies footasylum footlocker forma formaggi formaggis formas formastudio formastudios forno fornos forsyth forsyths fortnum fortnums fortwayne fortwilliam fortworth foster fosters fox foxs fr france frances francesca francescana francescanas francescas francisco franciscos francois frank franks fraser frasers frau frauen fraulein fred freddie freddies fredoka fredokas freds fremont fresca frescas fresno freya freyas fri friday fridays fris frontend frontends frs ft fts fuego fuegos fuegostreettacos fuegotacotruck fuegotacotrucks fugiat fugiats fujifilm fulford fullbleed fullstack fulwood funghi funghis futuresystems fyi fylde gabe gabes gabriel gabriels gael gaels gaeta gaetas gaggenau gaggenaus galentine galentines galerie galeries gallo gallos galway gambler gamblers gamblerses gant garamond garamonds garcia garcias garde gardes gardner gardners gareth gareths garforth garland garlands garlandses garrowby gary garys gateshead gatsby gatsbys gaz gazs gc gcs gdp gdps ge geelong gemma gemmas gen general generals genesis genesises gens geoff geoffrey geoffreys geoffs george georges georgia georgias geraint geraints gerald geralds germany ges gf gfs ghd gianna giannas giant gibson gibsons gifs giftregistry giftregistrys gilbert gill gillian gillians gillingham gills gingerbread gingerbreads ginza ginzas giovanni giovannis gipton gisborne github githubs gladstone glamorgan glasgow glasshoughton gleadless glen glenda glendale glendas glenn glenns glenrothes glens gloria glorias gloucester gloucestershire glsl glsls godchild godchildren godchildrens godchilds goddaughter goddaughters goddaughterses godfather godfathers godfatherses godmother godmothers godmotherses godson godsons godsonses goldcoast goldthorpe gomez gomezs gonzalez gonzalezs googleapis googlefonts goole gordon gordons gorgonzola gorgonzolas gou gouda goudas gous governor governors gpa gpas gpus grace graces gracie gracies graham grahams gramps grampses gran grandad grandads grandadses granddad granddads granddadses grandempress grandrapids grangemouth grannies granny grannys grans granses grant grants gravesend gray grays grayson graysons greatermanchester greece green greenock greens greensboro greggs gregory gregorys greyson greysons griffiths griffithses grimethorpe groom grooms groomses groomsman groomsmans groomsmen groomsmens grotesk grotesks gshock gt gtm gtms gts gua guam guas gucci guestbook guestbooks guestbookses guildford guiseley guru gurus gutierrez gutierrezs gwen gwens gwent gwynedd gymshark haccp haccps hackathon hackathons hadid hadids hadley hadleys hadoop hadoops halfords halifax hall hallie hallies halloween halloweens hallowsball hallowsballs halls halton hamilton hamiltons hamish hamishs hamleys hampshire handsworth hanna hannah hannahs hannahses hannas hannases hanoi hans hanukkah hanukkahs happypawssalon happypawssalons harborfront harborfronts harborview harborviews hardden harehills harewood harlow harold harolds harper harpers harriet harriets harrington harringtons harringtonvance harringtonvances harris harrises harrison harrisons harrods harrogate harry harrys harthill hartlepool harvard harvards harvey harveynichols harveys hashtag hashtags hastings hatfield havercroft haverfordwest hawaii hawes hawksworth haworth hayden haydens hayes hayley hayleys hazel hazels hd hdr hdrs hds headingley headmaster headmasters headmistress headmistresses headteacher headteachers hebburn hebdenbridge hebrides heckmondwike hedon heeley heidi heidis heidises helen helens helmsley helsinki helvetica helveticas hemelhempstead hemingbrough hemsworth henderson hendersons hendo hendos hendrerit hendrerits henparty henpartys henrik henriks henry henrys hepa hepas hereford herefordshire hernandez hernandezs herr herren hertfordshire herveybay herzegovina hessle heworth hexcode hexham higgins higginses highlands highness highnesses hiit hiits hilary hilarys hill hills hillsborough himalayan himalayans hinckley hm hmart hobart hogmanay hogmanays hojicha hojichas hokkaido hokkaidos holbeck holi holis hollister holly hollys hollywood hollywoods holmes holmfirth holt holts holyhead holywood homebargains hon honeywell honeywells honley honolulu honor honorable honors honorses honourable hons hoover hopefoundationgala hopefoundationgalas hopkins hopkinses horbury hornsea horsforth hotate hotates hotpoint houseoffraser houston hove howden hoyland hp hps hr hrh hrs hrv hrvs https hubbies hubby hubbys huddersfield hudson hudsons hughes hugo hugoboss hugos huila huilas hull humberside hungary hunslet hunt hunter hunters huntington hunts huntsville hwy hwys hydepark hyderabad hywel hywels i iain iains ian ians ib ibs iceland icelands icu icus idaho ideo ideos idk idle idris idrises iga igp igps ii iis il ilkley illinois ils im imam imams imax imaxs imposition ims inbody inbodys inc incididunt incididunts incs indesign indesigns indesit indiana indianapolis inlaw inlaws inlawses insp inspector inspectors inspo insps insta instagram intake intermarche intl intls invercargill inverness invisalign invisaligns invite invites iona ionas iowa ip ipo ipos ips ipsum ipsums ipswich iq iqs ireland irene irenes irina irinas iris irises ironandpulse ironandpulses irr irrs irure irures irvine irving isaac isaacs isabella isabellas isabelle isabelles isaiah isaiahs isla islamabad islas islay islays ist istanbul ists ital italia italian italians italias itals italy iv ivs ivy ivys izakaya izakayas jack jacks jackses jackson jacksons jacksonville jacob jacobs jade jades jakarta jake jakes jalisco jaliscos james jameson jamesons jamie jamies jan jane janedoe janedoes janes janet janets jans january januarys japanese japaneses jarrow jasmine jasmines jason jasons jasper jaspers jax jaxon jaxons jaxs jay jayden jaydens jaye jayes jays jdsports jean jeanette jeanettes jeans jeffrey jeffreys jen jenkins jenkinses jenn jenna jennas jenni jennifer jennifers jennis jenns jens jeremiah jeremiahs jerry jerrys jerseycity jerusalem jess jesse jesses jessica jessicas jessie jessies jimenez jimenezs jira jiras joan joanna joannas joannases joanne joannes joans joe joel joels joes johannesburg john johndoe johndoes johnlewis johnny johnnys johns johnson johnsons johnston johnstons jonathan jonathans jones jordan jordans jordanthorpe jose josefin josefins joseph josephine josephines josephs joses josh joshs joshua joshuas josiah josiahs joules joyce joyces jpegs jpgs jr jrs js jsmith jsmiths json jude judes judge judges judith judiths judy judys jul julia julian julianmoretti julianmorettis julians julias julie julies juls july julys jumbo jumbos jun june junes juneteenth juneteenths junior juniors junmai junmais juns juris justeat justice justices justin justins jvance jvances kabul kade kades kadie kadies kady kadys kadyses kafka kafkas kahlua kahluas kai kais kaitakahashi kaitakahashis kansas kansascity karachi karen karens kate kates kath katherine katherines kathleen kathleens kathleenses kathmandu kaths kathses kathy kathys kathyses katie katies katy katys kaytranada kaytranadas keighley keith keiths kelly kellys kelowna kemp kemps kendal kendrick kendricks kenji kenjis kennedy kennedys kensington kensingtons kent kentucky kerning kerr kerrs kerry kerrys kettering kev kevin kevins kevinses kevs kevses keyfood kfc khan khans kian kians kiddo kiddos kiddoses kids kidses kieran kierans kiev kilkeel kilkenny killian killians kilmarnock kilnhurst kim kims kincardineshire king kings kingsbridge kingsbridges kingston kingstons kinross kinsley kinsleys kippax kirkburton kirkbymoorside kirkcaldy kirkcudbrightshire kirkstall kirsten kirstens kirsty kirstys kitchener kiveton kivetonpark km kms kn knaresborough knight knights knottingley knoxville kns knutsford kolkata kombucha kombuchas kosho koshos kosovo kouign kouigns kristen kristens kristin kristins kroger krogers ksenia ksenias kualalumpur kubernetes kunsthalle kunsthalles kunsthallestudio kunsthallestudios kuroshio kuroshios kuroshiosushi kuroshiosushis kuwait kwanzaa kwanzaas kwiksave kyiv kyle kyles kylie kylies kyoto kyotos labore labores laboris laborum laborums labrador lachlan lachlans lacoste ladies lady lagos lahore lamar lamars lanarkshire lancashire lancaster lance landon landons lao laos lapaz lara laras laredo larne lasvegas lato latos latvia laude laudes launceston laura lauras lauren laurens laurent laurents lawfirm lawfirms lawrence lawrences layla laylas lb lbs le leah leahs leanne leannes lecturer lecturers ledsham ledston lee leeds lees leicester leicestershire leigh leilani leilanis leo leon leonardo leonardos leons leos leprechaun leprechauns les lesley lesleys levain levains levi levis lewis lewises lexington leyburn leyland lg liam liams lidl lidls lieut lieutenant lieutenants lieuts lifecycle lifecycles ligatures lightmode liliana lilianas lillie lillies lily lilys lima limavady limerick lincoln lincolns lincolnshire linda lindas lindqvist lindqvists linkedin lisa lisas lisbon lisburn listerhills lithuania littlerock liverpool livestream livestreamed livestreaming livestreams livingston ljubljana llandudno llanelli llewellyn llewellyns llm llms lloyd lloyds lloydspharmacy llp llps lms lofthouse logan logans lola lolas londis london londonderry longbeach lookbook lookbooks lopez lopezs lora loras lord lords lorem lorems lorraine lorraines losangeles lothian lotussanctuaryspa lotussanctuaryspas loughborough louis louise louises louisiana louisville lowmoor lowri lowris loyola loyolas lt lts lubbock luca lucas lucases lucy lucys lukas luke lukes lululemon lumi lumiere lumieres lumierestudio lumierestudios lumierevisuals lumis luna lunas lush luton lydia lydias lyft lyla lylas lys mabel mabels macclesfield macdonald macdonalds macedonia macgregor macgregors macintyre macintyres mackay mackenzie mackenzies mackintosh mackintoshs maclachlan maclachlans maclean macleans macleod macleods macpherson macphersons madagascar madagascars madison madisons madrid maeda maedas maeve maeves maggie maggies magherafelt magistrate magistrates magna magnas maid maidofhonor maidofhonors maids maidses maidstone maine maisie maisies maison maisoneleve maisoneleves maisonfleur maisonfleurs maisonrosebeauty maisonrosebeautys maisons maisonstudio maisonstudios maj majesties majesty major majors majs makerspace makerspaces makro malcolm malcolms malta maltby malton manchester mandap mandaps mandapses mango manila manitoba maplewood maplewoods maplin mapplewell mar marcellus march marchs marco marcos marcus marcuses mardigras margaret margarets margate margherita margheritas marie maries marina marinas marion marions mark marketweighton marks marksandspencer marksandspencers markses marnie marnies marquess marquis marquises mars marsh marshal marshall marshalls marshals marshs martha marthas martin martinez martinezs martins mary maryland marys marzano marzanos mason masons massachusetts massimo massimos master masterplan masterplans matalan matcha matchas mateo mateos matronofhonor matronofhonors matt matteo matteos matthew matthews matthewses matts matty mattys maureen maureens maverick mavericks max maxine maxines maxs maxses may maya mayas mayor mayoress mayoresses mayors mays mcdonalds mckinsey mckinseys md mdcccxii mdcccxiis mds meadowbrook meadowbrooks meanwood medcare medcares medicalcenter medicalcenters medjool medjools meg megan megans megs meijer melanie melanies melbourne meltham memphis mendoza mendozas menorah menorahs menston menu menucard menucards menus menuses menzies mercadona meridianmotors merriweather merriweathers merseyside merthyr merthyrtydfil mervyn mervyns mesa messrs metadata methley metrocitymarathon metrocitymarathons mexborough mexicocity meyer meyers mezcalita mezcalitas mfa mfas mgmt mgmts mia miami mias micah micahs michael michaels michelin michelins michigan micklefield microservices microsoft microsofts middlesbrough middlesex middlestown middleton middot middots midsummer midsummers midweek midweeks midwinter midwinters miele mike mikes mikey mikeys mikeyses mila milan milana milanas milano milanos milans milas mildura miles milfordhaven miller millers millie millies milly millys milo milos miltonkeynes milwaukee min mindsetmastery mindsetmasterys minim minimap minimaps minims minister ministers minneapolis minnesota mins minsk mirfield miss misses mississippi missouri mistletoe mistletoes mit mitchell mitchells mits miyazaki miyazakis ml mlle mlles mlops mls mme mmes mog mogs mogses moldova molestie molesties mollie mollies mollit mollits molly mollys mon moncton monday mondays monkbretton monmouthshire monoprix monospace mons monsieur monsieurs monsignor montaigne montaignes montana montenegro montevideo montgomery montgomerys montreal montrose montroses montserrat montserrats monzo moore moores moorthorpe moortown morag morags morales morayshire morecambe moretti morettis morgan morgans morley morningside morningsides moroccan moroccans morpeth morris morrises morrison morrisons mosborough moscone moscones moscow motherinlaw motherinlaws motherwell mp mph mphs mps mr mri mris mrs ms msgr msrp msrps mst msts mufti muftis mulberry mullingar multi multis mum mumbai mums mumses murphy murphys murray murrays muscat mvance mvances mvp mvps mx myles myofascial myofascials naas nadia nadias nairnshire nairobi nana nanas nanases nancy nancys nandos nanna nannas nannases nantwich naomi naomis napier naples napoletana napoletanas napoli napolis nashville natalia natalias natasha natashas natashases nathan nathans navan ncaa ncaas nd nds neath neathporttalbot nebraska neighbor neighbors neighborses neil neils nelson neonnights nero nespresso netflix netheredge netherlands netherton netto nettos neue neues nevada newark newbridge newbrunswick newcastle newfoundland newhampshire newjersey newlook newlywed newlyweds newlywedses newman newmans newmexico newmillerdam neworleans newplymouth newport newquay newry newsouthwales newtonmearns newtownabbey newtownards newyear newyears newyork next nexusai nexusais nexusaistudio nexusaistudios nexuscareers nfts nguyen nguyens nia niall nialls niamh niamhs nias nicholas nicola nicolas nicosia nigel nigels nike nikes nikiri nikiris nikon ninja nlp nlps noah noahs noel noels noirstudio noirstudios nolan nolans nonna nonnas nonnases nonno nonnos nonnoses nora norah norahs noras nordicco nordiccos norfolk normanton northallerton northampton northamptonshire northcarolina northdakota northferriby northshields northumberland northwich northyorkshire norway norwegian norwegians norwich nostrud nostruds nottingham nottinghamshire notton nov nova novas novascotia november novembers novs nulla nullam nullams nullas nunavut nutcracker nutcrackers nutty nuttys nw nws nyt nyts o oakland oakridge oakridges oakwood oakworth oaxaca oaxacas oban obrien obriens ocado ocados occaecat occaecats oceania oconnor oconnors oct october octobers octs odesza odeszas officer officers officia officiant officiants officiantses officias ohio oj ojs oklahoma oklahomacity oldham olga olgas oliver olivers olivia olivias ollie ollies olympic olympics omagh omaha omakase omakases omega omg onboarding oneill oneills ontario ootd openpub openpubs opub orange orbitron orbitrons orderoftheday orderofthedays oregon org orgs orkney orla orlando orlas ormskirk ortiz ortizs oscar oscars osha oshas oshawa osian osians oslo ossett osteria osteriabellini osteriabellinis osterias oswald oswalds otd otds otley ottawa oulton outwood overton owen owens oxenhope oxford oxfordshire oz ozs paddleboarding paddleboardings padre pageboy pageboys pageboyses paige paiges paisley paisleys palmer palmers palmerstonnorth palo paloma palomas palos pam pamela pamelas pams panasonic pandora panela panelas papa papajohns papas papases parfum parfums pariatur pariaturs paris parisian parisians parker parkers parliamentarian parliamentarians parma parmas parsoncross pasadena pasadenas passionfruit passionfruits pastor pastors pat patagonia patagonias patel patels patricia patricias patrick patricks pats paul paula paulas pauls pauly paulys pawdicure pawdicures pawsandpamper pawsandpampers payne paynes paypal pcs pcworld pdfs peacocks pearson pearsons peated peateds peeblesshire pembroke pembrokeshire pendleton pendletons pendletontribute pendletontributes penelope penelopes penistone pennsylvania penny pennys penrith penzance pepe pepes perez perezs perth perthshire peter peterborough peterhead peters petsathome pexels peyton peytons pg pgs ph philadelphia philip philips phillips phillipses phoenix phs pic pickering pico picos pics pigglywiggly pilates pinecrest pinecrests pinterest piper pipers pitmaster pitmasters pitsmoor pittsburgh pixabay pizzaexpress pizzahut pizze pizzes pkwy pkwys placecard placecards placecardses placeholder placeholders plano playfair playfairs plg plgs pls plt plymouth pm pmo pmolead pmoleads pmos pmp pmps pms pngs pocklington podcaster podcasters podcasts podgorica poinsettia poinsettias poland polina polinas pommes pontefract pontypridd pool poole pop pope popes popover popovers poppins poppleton poppy poppys pops popses popup popups portland portlaoise portmacquarie portrush portsmouth portstewart portugal postgres postgresql postgresqls potternewton poundland poundstretcher poundworld powell powells powys ppi pr prada prague pranasanctuary pranasanctuarys pranayogastudio pranayogastudios prancer prancers prelate premier premiers pres preses president presidents preston pret pretoria prettylittlething price prices priest priests primark primate primates primeminister prince princes princess princesses principal principals pristina pritzker pritzkers private privates processional processionals prof professor professors profs program programme programmes programs programses proident proidents proofing provencal provencals provence provences providence provost provosts prs pta ptas publix pudsey puertorico pugliese puglieses pulitzer pulitzers pullandbear purston pvt pvts pwa pytorch pytorchs qa qas qna qrcode qrcodes qsbs quantumflow quantumflows quattro quattros quebec queen queens queensbury queensland quesabirria quesabirrias queso quesos quinn quinns quis quito rabat rabbi rabbinical rabbis rachel rachels rachelses raelynn raelynns raleigh ralph ralphlauren ralphs ramadan ramadans ramirez ramirezs ramos ramsgate randy randys ranmoor raster ravenwood ravenwoods rawcliffe rawdon rawmarsh ray raymond raymonds rays rd rds reading reagan reagans rebecca rebeccah rebeccahs rebeccas recap recaps reception receptions receptionses recessional recessionals rector rectors redcar reddit redditor redis reebok reggiano reggianos reggie reggies regina rehearsaldinner rehearsaldinners reid reids reindeer reindeers renfrew renfrewshire reno rep reprehenderit reprehenderits representative representatives reps req reqs reserved retweets reuben reubens rev reverend reverends revit revits revolut revs rewe reyes reykjavik reynolds reynoldses rgba rhian rhiannon rhiannons rhians rhode rhodeisland rhodes rhodri rhodris rhona rhonas rhonddacynontaf rhyl rhys rhyses riccall richard richards richardses richardson richardsons richmond riga right rignon rignons riley rileys ringbearer ringbearers ringbearerses riodejaneiro ripon risd risds ristretto ristrettos rita ritas rituals river rivera riveras riverisland rivers riverside riyadh rn rns roadmap roadmaps roas roastery roasterys rob robata robatas robbie robbies robby robbys robert roberts robertses robertson robertsons robinhood robinson robinsons roboto robotos robs robyn robyns rochdale rochester rockefeller rockefellers rockerslive rockerslives rockhampton rodriguez rodriguezs roger rogers rogerses roi rois roisin roisins rolex roman romania romans rome romero romeros ronan ronans ronnie ronnies roosevelt roosevelts rory rorys ros rosal rosals rose roses rosie rosies ross rosse rosses rossi rossington rossis rosso rossos rostova rostovas rotherham rothwell rotorua roundhay rowan rowans roxburghshire roy royal royale royales roys royston rpg rpgs rpm rpms rsvp rsvpd rsvpds rsvping rsvpings rsvps rsvpses rt ruby rubys rudolph rudolphs rufus ruiz ruizs runcorn runtime runtimes rush rushden russ russell russells russes russia ruth rutherglen ruths rutland ry ryan ryans ryder ryders ryhill ryman rymans rys saas sacramento sadie sadies safeway safeways saguenay sahara saharas sainsbury sainsburys saintlouis saintpaul saintpetersburg saison saisons sakura sakuras sale salem salems salford salisbury sally sallys sallyses saltaire saltlake saltlakecity sam sammy sammys sams samses samsung samuel samuels sanantonio sanchez sanchezs sandal sanders sandiego sandra sandras sandy sandys sanfrancisco sanjose sansserif santa santaana santas santiago santiagos santorini santorinis saoirse saoirses saopaulo sarah sarahs sarajevo sartoria sartorias sas saskatchewan saskatoon sat sato satos sats saturday saturdays sauvignon sauvignons savannah savers savethedate savethedates saveur saveurs sc scamorza scamorzas scarborough scarcroft scarlett scarletts scholes schoolbell schoolbells schuh sci scis scissett scotland scott scotts scottsdale screenshots screenshotted screwfix scs sdk sdks se seabob seabobs seacroft seamus seamuses sean seans seatingchart seatingcharts seatingchartses seattle seb sebastian sebastians sebs sed sedona sedonas seds seiko selby selfie selfies selfridges selkirkshire sen senator senators senior seniors senor senora senoras senores senorita senoritas sens seo seos seoul sep sephora seps sept september septembers septs serbia seren serengeti serengetis serenity serenitys serenityspa serenityspas serens sergeant sergeants sergt sergts serif serifs serverless ses sesquicentennial sesquicentennials settle sf sfs sg sgs sgt sgts shadwell shakshuka shakshukas shamrock shamrocks shane shanes shanghai shannon shannons shareables shark sharlston sharon sharons shaun shauna shaunas shauns shaunses shaw shawn shawns shaws sheepscar sheffield sheikh sheikhs sheila sheilas shein shepparton sherbrooke sherburn sheriff sheriffs shetland shields shipley shirley shirleys shizuoka shizuokas shona shonas shoprite shrewsbury shropshire sian sians sicilian siciliani sicilianis sicilians sicily sicilys siemens sienna siennas signor signora signore signori signorina signorine silas silkstone silsden simon simons simpson simpsons sinclair sinclairs sinead sineads singapore singh singhs sint sints siobhan siobhans siouxfalls sir sirs sis sister sisterinlaw sisterinlaws sisters sit sitewide sitewides sits siward siwards skellow skelmanthorpe skelmersdale sketchup sketchups skipton skopje sku skus skye skyes skylar skylars skype skywwalk skywwalks sla slack slas sligo slough slovakia slovenia sm smartsheet smartsheets smb smbs smeg smith smiths sms snaith snapchat snappy snappysnaps snaps snowman snowmans snowmen snowmens sofia sofias soir soirs solaris solicitor solicitors solidworks solstice solsticefestival solsticefestivals solstices somerfield somerset sonia sonias sonny sonnys sonoma sonomas sonoran sonorans sonos sony sonya sonyas sophia sophiaandjulian sophiaandjulians sophias sophie sophies soppressata soppressatas sorcha sorchas soren sorens sothall sotherby sotherbycrown sotherbycrowns sotherbys soundcheck soundchecks southampton southaustralia southcarolina southcave southdakota southelmsall southend southkirkby southport southshields southyorkshire sovereignestates sowerby sowerbybridge spacenk spain spanish spanishs spar sparklingcleanhomes spars spc spcs spellcheck spellchecker spenborough spencer spencers spokane spoons sportsdirect spotify springtime springtimes sprotbrough spudshed sq sqft sqfts sql sqls sqs squalane squalanes sr sriracha srirachas srs stacey staceys stacy stacys stafford staffordshire stagdo stagdos stagparty stagpartys stainforth stairfoot stalbans standrews stanford stanfords stanley stanningley stannington staples starbucks starling starlink starlinks stationery stationerys steeton steffan steffans stella stellas stepbrother stepbrothers stepbrotherses stepdad stepdads stepdadses stepdaughter stepdaughters stepdaughterses stephen stephens stepmom stepmoms stepmomses stepmum stepmums stepmumses stepsister stepsisters stepsisterses stepson stepsons stepsonses sterlingvance sterlingvancecpa sterlingvancecpas sterlingvances steve steven stevenage stevens stevenses steves stewart stewarts sthelens stirling stirlingshire stives stjohns stlouis stockholm stockport stocksbridge stockton stoke stone stones stopandshop storytime storytimes stpatrick stpatricks stpaul stpetersburg strabane stradivarius strathclyde streethouse strensall stretford stridesofhope stridesofhopes stripe stuart stuarts studioforma studioformas studiolumiere studiolumieres stylesheet stylesheets subpixel subways sudbury sue sues suffolk summa summas summertime summertimes sun sunday sundays sunderland sunnyside suns sunt sunts supercuts superdrug superdry superintendent superintendents supt supts surrey susan susans sussex sutherland sutherlands suzanne suzannes suzie suzies suzy suzys svetlana svetlanas svgs sw swallownest swami swamis swansea swarovski swatch swatches sweden sweethearttable sweethearttables swillington swindon swinton switzerland sws sydney sza szas tablecard tablecards tablecardses tablemarker tablemarkers tablemarkerses tableplan tableplans tableplanses tablescapes tableside tablesides tacoma tadcaster tagheuer tagliarin tagliarins tagout tagouts tahitian tahitians tajin tajins takahashi takahashis taliesin taliesins tallahassee tallinn tammy tammys tampa tamworth tanya tanyas target targets tasha tashas tashases tasmania tataki tatakis tatecollective tatecollectives taunton tauranga taylor taylors tba tbd tbh tbilisi tbwa tbwas teamlab teamlabs teau teaus techflow techflows tees tehran telaviv telegram telford tellicherry tellicherrys tempor tempors temu tenby tennessee terence terences teresa teresas terry terrys tesco tescos texas textbox textboxes th thackley thalasso thalassos thanet thanksgiving thanksgivings thea theas thebodyshop theillustrious theo theodore theodores theos therange thesaurus thirsk thomas thomases thompson thompsons thorne thorner thornton thorntonfamily thorntonfamilys thorpe thrybergh ths thu thur thurnscoe thurs thursday thursdays thus thx tibetan tibetans tickhill tierra tierras tiffany tiktok tilly tillys tim timberland timhortons timmy timmys timothy timothys tims tina tinas tingley tinshill tirana tjmaxx tkmaxx tncc tnccs toastmaster toastmasters toastmasterses toby tobys todmorden todwick tokyo toledo tom tommy tommyhilfiger tommys tommyses toms toniandguy tonnato tonnatos toolstation tooltip tooltips toowoomba topman topshop toptable toptables torbay torfaen toronto torquay torres totley townsville tracey traceys tracking tracy tracys traderjoes tradizionale tradizionales train trains trainses tralee transitioned transitioneds treeton trevor trevors tri tripoli tris troisrivieres trooper troopers trousseau trousseaus truro tsukiji tsukijis tt tucker tuckers tucson tue tues tuesday tuesdays tulsa tunbridge tunis turkey turner turners tuscany tuscanys tutor tutors tv tvs tx txs ty tyler tylers tyneandwear tynemouth typeface typefaces tyrone tzu tzus uber ubereats ucl ucla uclas ucls ui uis uji ujis uk ukraine uks ullamco ullamcos ulster umea umeas unagi unagis unboxing uncle uncles underarmour undercliffe unfollow unfollowed uniqlo unsplash upton url urls usa usas usatf usatfs usd usds usher ushers usherses utah ux uxs vacay vacays val valentine valentines valeofglamorgan valerie valeries valletta valmont valmonts vals vance vancehorology vancehorologys vancemarketing vancemarketings vances vancesterlinglaw vancesterlinglaws vancouver vanguardheritage vanguardheritages vans vasquez vasquezs vata vatas vax ve vector vehicula vehiculas veil veils veilses velit velits velvetalchemy velvetalchemys veniam veniams venmo verace veraces vercel vercels verdantkitchen verdantkitchens verde verdes vermont veronica veronicas versace vertexlabs ves vibe vibes vicar vicars vicechancellor vicki vickis vicky vickys victor victoria victorias victors vienna viewport vilnius vincent vincents vinted vinyasa vinyasas violet violets violette violettes vip vips virginia virginiabeach viscount viscountess viscountesses viscounts visionos vitalitypro vitalitypros vitello vitellos vivamus vivian vivians vixen vixens vlog vlogger vloggers vlogs vo voluptate voluptates vos vows vowses vp vpc vpcs vps vr vrs vs wa wadsley wagga waitrose waitroses wakefield wales walker walkers walkley walkthrough walkthroughs wallace wallaces wallasey wallsend walmart walmarts walsh walshs walter walters walton ward warden wardens wards warrenpoint warrington warsaw warwickshire was washington washingtondc waterford waterstones watford wath watson watsons watts wattses waylon waylons wayne waynes web webassembly webassemblys webb webbs webfonts webgl webgls webgpu webgpus webp webster websters wed weddinglist weddinglists weddingparty weddingpartys wednesday wednesdays weds weekday weekdays weekend weekends weeknd weeknds weetwood wegmans wellington wellpharmacy welwyn wendy wendys wesley wesleys wessex westernaustralia westhighboosters westmidlands westvirginia westwood westyorkshire wetherby wetherspoon wetherspoons wexford weymouth wght wghts whanganui whangarei wharton whartons whatsapp wheatley whiston whitby white whitehaven whites whitfield whitfields whitkirk whitleybay wholefoods whsmith wichita wickersley wickes widnes wieden wiedens wifey wifeys wifeyses wifi wigan wigtownshire wildearth wildearths wildflowerfern wildflowerferns wilkinson wilkinsons wilko will willerby william williams williamses williamson williamsons willie willies willoughby willow willows wills wilmslow wilsden wilshire wilshires wilson wilsons wiltshire winchester windsor winndixie winnipeg winsford winstonsalem wintergala wintergalas wintertime wintertimes wireframe wireframes wiretech wiretechs wirral wisconsin wishaw withernsea wodonga woking wollongong wolverhampton wombwell wood woodall woodhouse woodlands woodlesford woods woodseats woodway woodways woolies woolley woolworths worcester worcestershire wordart workflows workington worthing wortley wrenthorpe wrexham wright wrights wt wts www wwws wyatt wyatts wyke wyoming xavier xaviers ximena ximenas xmas xml xr xrs xx xxs yeadon yeovil yerevan yirgacheffe yirgacheffes york yorkshire young youngs youtube youtuber youtubers yoy yoys yr yrs yt yukon yuletide yuletides yulia yulias yvette yvettes yvonne yvonnes zac zachary zacharys zack zacks zacs zagreb zaha zahas zane zanes zanussi zara zion zions zoe zoes zoey zoeys zoom zurich zurichs";
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
        'Officer', 'Governor', 'President', 'Uncle', 'Aunt', 'Aunty', 'Grandad',
        'Granddad', 'Granny', 'Nana'
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

        // Informal plural or un-apostrophized possessive check: e.g. "Mikeys" -> "mikey", "Jacks" -> "jack", "Brants" -> "brant"
        if (clean.length > 3 && clean.endsWith("s") && !clean.endsWith("ss")) {
            const base = clean.slice(0, -1);
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
