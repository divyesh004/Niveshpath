/**
 * Chatbot Training Data
 * 
 * This file contains training data for the NiveshPath Chatbot
 * with various intents and example queries for financial advice.
 */

// Training data with intents, examples, and responses
const trainingData = [
  { 
    "intent": "greeting", 
    "examples": ["Hi", "Hello", "Hey", "Good morning", "Good evening"], 
    "response": "Hi there! 👋 Great to hear from you. I specialize in personal finance—feel free to ask me anything about investments, savings, or planning your money wisely!" 
  }, 
  { 
    "intent": "ask_savings_advice", 
    "examples": [ 
      "How can I save more money?", 
      "Tips for saving money", 
      "How to manage savings?", 
      "Monthly savings plan" 
    ], 
    "response": "Saving is a great habit! Aim to save at least 20% of your income. Start by tracking your expenses, setting a budget, and automating your savings every month. Consider creating separate accounts for different financial goals to stay organized and motivated." 
  }, 
  { 
    "intent": "ask_investment_advice", 
    "examples": [ 
      "Where should I invest?", 
      "Best investment options", 
      "How to start investing?", 
      "Mutual funds or stocks?" 
    ], 
    "response": "Investing depends on your risk appetite and goals. For beginners, SIP in mutual funds is a good option. Always diversify your portfolio across different asset classes like equity, debt, and gold. Consider your time horizon—longer periods allow for more equity exposure. If needed, consult a certified financial advisor for personalized guidance." 
  }, 
  { 
    "intent": "ask_budgeting_tips", 
    "examples": [ 
      "How to create a budget?", 
      "Budgeting tips", 
      "How to control expenses?", 
      "Budget management" 
    ], 
    "response": "Follow the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings/investments. Start by tracking all expenses for a month to understand your spending patterns. Use budgeting apps to automate tracking and set spending alerts. Review your budget regularly and adjust as needed. Remember, budgeting isn't about restriction—it's about making intentional choices with your money." 
  }, 
  { 
    "intent": "ask_credit_score", 
    "examples": [ 
      "What is a good credit score?", 
      "How to improve credit score?", 
      "Credit score tips" 
    ], 
    "response": "A credit score above 750 is considered good in India. To improve your score: 1) Pay all EMIs and credit card bills on time, 2) Maintain a credit utilization ratio below 30%, 3) Avoid applying for multiple loans simultaneously, 4) Keep old credit accounts active, and 5) Regularly check your credit report for errors. A good score helps you secure loans at better interest rates and improves approval chances." 
  }, 
  { 
    "intent": "ask_tax_saving", 
    "examples": [ 
      "How to save tax?", 
      "Tax saving tips", 
      "Best tax saving investment", 
      "Section 80C options" 
    ], 
    "response": "You can save tax by investing in ELSS (Equity Linked Savings Scheme), PPF (Public Provident Fund), NPS (National Pension System), Life Insurance premiums, and claiming deductions under Section 80C (up to ₹1.5 lakh). Additional deductions are available under Section 80D for health insurance, Section 80G for donations, and Section 24 for home loan interest. Consider tax-efficient investments based on your risk profile and financial goals. Always consult a tax expert for personalized advice." 
  }, 
  { 
    "intent": "ask_emergency_fund", 
    "examples": [ 
      "What is an emergency fund?", 
      "How much emergency fund should I have?", 
      "Why do I need an emergency fund?" 
    ], 
    "response": "An emergency fund is a savings buffer to cover 3-6 months of essential expenses in case of unexpected situations like job loss, medical emergencies, or urgent home repairs. Keep it in a liquid and easily accessible account like a high-yield savings account or liquid funds. Start small if needed—even ₹5,000 per month adds up. Your emergency fund provides financial security and prevents you from going into debt during difficult times." 
  }, 
  { 
    "intent": "disclaimer", 
    "examples": [ 
      "Should I follow your advice?", 
      "Are you a financial advisor?", 
      "Is this professional advice?" 
    ], 
    "response": "I provide general financial guidance based on common practices and principles. While I strive to be accurate and helpful, I'm not a certified financial advisor. For personalized financial planning tailored to your specific situation, always consult a SEBI-registered investment advisor or certified financial planner. Financial decisions should be made after careful consideration of your unique circumstances, goals, and risk tolerance." 
  }, 
  { 
    "intent": "farewell", 
    "examples": ["Bye", "Goodbye", "See you", "Thanks", "Talk to you later"], 
    "response": "You're welcome! Feel free to come back anytime for more personal finance tips. Remember, small consistent steps lead to significant financial progress over time. Have a great day!" 
  },
  { 
    "intent": "non_finance_query", 
    "examples": [ 
      "movie recommendations", 
      "tech help", 
      "travel advice", 
      "recipe", 
      "weather", 
      "sports", 
      "politics", 
      "entertainment", 
      "gaming", 
      "fashion", 
      "dating", 
      "health", 
      "fitness", 
      "coding", 
      "programming", 
      "music", 
      "books", 
      "art" 
    ], 
    "response": "Ah, I'm afraid I can't help with that—my expertise is strictly focused on personal finance and investments. But I'd love to help you understand things like mutual funds, budgeting, or SIPs. For example, you could ask me: 'Which is better—FD or mutual funds for 5 years?' 😊" 
  } 
];

// Helper function to find the best matching intent for a given query
function findIntent(query) {
  // Convert query to lowercase for case-insensitive matching
  const normalizedQuery = query.toLowerCase();
  
  // Find the intent with the highest match score
  let bestMatch = {
    intent: null,
    score: 0
  };
  
  // First check if this is a non-finance query
  const nonFinanceIntent = trainingData.find(item => item.intent === "non_finance_query");
  if (nonFinanceIntent) {
    // Check if query contains any non-finance related keywords
    for (const example of nonFinanceIntent.examples) {
      if (normalizedQuery.includes(example.toLowerCase())) {
        return "non_finance_query";
      }
    }
    
    // Additional check for common non-finance topics
    const nonFinanceTopics = [
      "movie", "film", "tv show", "series", "actor", "actress",
      "computer", "laptop", "phone", "device", "software", "app",
      "travel", "vacation", "holiday", "flight", "hotel", "destination",
      "recipe", "cook", "food", "dish", "meal", "restaurant",
      "weather", "temperature", "forecast", "rain", "snow",
      "sports", "game", "team", "player", "match", "tournament",
      "politics", "government", "election", "president", "minister",
      "celebrity", "famous", "star", "entertainment", "concert",
      "gaming", "video game", "console", "play station", "xbox",
      "fashion", "clothes", "dress", "style", "wear", "outfit",
      "dating", "relationship", "love", "partner", "marriage",
      "health", "disease", "symptom", "doctor", "medicine", "treatment",
      "fitness", "exercise", "workout", "gym", "diet", "nutrition",
      "coding", "programming", "developer", "software", "website",
      "music", "song", "artist", "band", "album", "concert",
      "book", "novel", "author", "read", "literature",
      "art", "painting", "drawing", "artist", "museum"
    ];
    
    for (const topic of nonFinanceTopics) {
      if (normalizedQuery.includes(topic)) {
        return "non_finance_query";
      }
    }
    
    // Check if query is likely not finance-related by checking for finance keywords
    const financeKeywords = ["money", "finance", "invest", "budget", "saving", "income", "expense", 
                           "tax", "loan", "debt", "credit", "bank", "insurance", "retirement", 
                           "mutual fund", "stock", "bond", "sip", "fd", "fixed deposit", "ppf", 
                           "nps", "pension", "financial", "rupee", "interest", "emi", "return",
                           "portfolio", "wealth", "asset", "liability", "dividend", "capital", "profit",
                           "loss", "market", "share", "equity", "demat", "trading", "inflation", "deflation",
                           "recession", "bull", "bear", "sensex", "nifty", "index", "fund", "scheme",
                           "roi", "return on investment", "cagr", "compound", "growth", "rate", "yield",
                           "maturity", "tenure", "principal", "amount", "corpus", "lumpsum", "installment",
                           "premium", "policy", "claim", "coverage", "sum assured", "nominee", "beneficiary",
                           "annuity", "gratuity", "provident", "epf", "esic", "salary", "compensation",
                           "bonus", "incentive", "commission", "cashback", "discount", "offer", "price",
                           "cost", "fee", "charge", "penalty", "fine", "due", "payment", "transaction",
                           "transfer", "deposit", "withdraw", "balance", "statement", "account", "savings",
                           "current", "recurring", "term", "gold", "silver", "metal", "commodity",
                           "currency", "forex", "dollar", "euro", "pound", "yen", "yuan", "crypto",
                           "bitcoin", "ethereum", "blockchain", "wallet", "upi", "netbanking", "card",
                           "credit card", "debit card", "atm", "pos", "merchant", "vendor", "seller",
                           "buyer", "customer", "client", "agent", "broker", "dealer", "distributor",
                           "manufacturer", "producer", "consumer", "retail", "wholesale", "business",
                           "company", "firm", "enterprise", "startup", "corporation", "llp", "proprietor",
                           "partnership", "sole", "private", "public", "limited", "unlimited", "listed",
                           "unlisted", "sebi", "rbi", "irda", "pfrda", "amfi", "exchange", "bse", "nse",
                           "mcx", "ncx", "itr", "income tax", "gst", "goods and services tax", "vat",
                           "service tax", "customs", "excise", "duty", "cess", "surcharge", "tds", "tcs",
                           "pan", "aadhaar", "kyc", "know your customer", "aml", "anti money laundering",
                           "fatca", "crs", "compliance", "regulation", "rule", "law", "act", "section",
                           "clause", "provision", "amendment", "notification", "circular", "guideline",
                           "directive", "mandate", "order", "judgment", "verdict", "case", "suit",
                           "litigation", "dispute", "resolution", "settlement", "agreement", "contract",
                           "deed", "document", "paper", "form", "application", "request", "proposal",
                           "quotation", "estimate", "invoice", "bill", "receipt", "voucher", "challan",
                           "cheque", "draft", "mandate", "nach", "ecs", "auto debit", "auto pay",
                           "standing instruction", "si", "ach", "rtgs", "neft", "imps", "swift", "wire",
                           "remittance", "inward", "outward", "domestic", "international", "foreign",
                           "nri", "pio", "oci", "resident", "non-resident", "citizen", "national",
                           "passport", "visa", "permit", "license", "registration", "incorporation",
                           "formation", "dissolution", "liquidation", "bankruptcy", "insolvency",
                           "restructuring", "reorganization", "merger", "acquisition", "takeover",
                           "buyout", "selloff", "divestment", "investment", "funding", "financing",
                           "lending", "borrowing", "underwriting", "subscription", "allotment", "allocation",
                           "distribution", "dividend", "bonus", "split", "consolidation", "rights", "issue",
                           "ipo", "fpo", "qip", "preferential", "private placement", "public issue",
                           "offer for sale", "ofs", "buyback", "repurchase", "redemption", "surrender",
                           "cancellation", "termination", "closure", "settlement", "clearing", "custody",
                           "depository", "participant", "dp", "registrar", "transfer agent", "rta",
                           "trustee", "sponsor", "promoter", "director", "board", "management", "ceo",
                           "cfo", "cio", "cto", "coo", "md", "chairman", "president", "vice president",
                           "avp", "svp", "evp", "gm", "dgm", "agm", "manager", "supervisor", "leader",
                           "head", "chief", "executive", "officer", "staff", "employee", "worker",
                           "labor", "personnel", "human resource", "hr", "recruitment", "selection",
                           "hiring", "onboarding", "induction", "training", "development", "performance",
                           "appraisal", "evaluation", "assessment", "feedback", "review", "rating",
                           "grade", "rank", "position", "designation", "role", "responsibility", "duty",
                           "function", "task", "job", "work", "assignment", "project", "program",
                           "scheme", "plan", "strategy", "tactic", "approach", "method", "technique",
                           "process", "procedure", "system", "framework", "structure", "architecture",
                           "design", "model", "pattern", "template", "format", "standard", "benchmark",
                           "target", "goal", "objective", "aim", "purpose", "mission", "vision", "value",
                           "principle", "ethics", "morals", "integrity", "honesty", "transparency",
                           "accountability", "responsibility", "liability", "obligation", "commitment",
                           "pledge", "promise", "assurance", "guarantee", "warranty", "indemnity",
                           "protection", "security", "safety", "risk", "hazard", "danger", "threat",
                           "vulnerability", "exposure", "coverage", "hedge", "diversification", "allocation",
                           "distribution", "spread", "concentration", "focus", "specialization", "niche",
                           "segment", "sector", "industry", "domain", "field", "area", "zone", "region",
                           "territory", "jurisdiction", "authority", "power", "control", "influence",
                           "impact", "effect", "result", "outcome", "output", "input", "throughput",
                           "productivity", "efficiency", "effectiveness", "performance", "quality",
                           "quantity", "volume", "size", "scale", "scope", "range", "extent", "limit",
                           "boundary", "constraint", "restriction", "condition", "term", "stipulation",
                           "provision", "clause", "article", "section", "chapter", "part", "division",
                           "unit", "component", "element", "factor", "variable", "parameter", "metric",
                           "measure", "indicator", "index", "ratio", "proportion", "percentage", "rate",
                           "frequency", "duration", "period", "interval", "gap", "space", "distance",
                           "proximity", "vicinity", "neighborhood", "locality", "location", "place",
                           "position", "site", "venue", "address", "contact", "detail", "information",
                           "data", "fact", "figure", "statistic", "number", "amount", "quantity", "sum",
                           "total", "aggregate", "cumulative", "collective", "combined", "consolidated",
                           "integrated", "unified", "harmonized", "synchronized", "coordinated", "aligned",
                           "matched", "paired", "coupled", "linked", "connected", "associated", "related",
                           "affiliated", "allied", "partnered", "collaborated", "cooperated", "coordinated",
                           "synergized", "leveraged", "utilized", "employed", "applied", "implemented",
                           "executed", "performed", "conducted", "carried out", "undertaken", "accomplished",
                           "achieved", "attained", "realized", "fulfilled", "satisfied", "met", "exceeded",
                           "surpassed", "outperformed", "outshined", "outdone", "beaten", "defeated",
                           "won", "gained", "earned", "acquired", "obtained", "procured", "secured",
                           "ensured", "guaranteed", "warranted", "certified", "verified", "validated",
                           "confirmed", "approved", "endorsed", "sanctioned", "authorized", "permitted",
                           "allowed", "granted", "conceded", "yielded", "surrendered", "relinquished",
                           "abandoned", "forsaken", "deserted", "left", "departed", "exited", "withdrawn",
                           "retired", "resigned", "quit", "stopped", "ceased", "halted", "paused",
                           "suspended", "interrupted", "disrupted", "disturbed", "interfered", "hindered",
                           "hampered", "impeded", "obstructed", "blocked", "barred", "banned", "prohibited",
                           "forbidden", "restricted", "limited", "constrained", "confined", "contained",
                           "controlled", "regulated", "governed", "managed", "administered", "supervised",
                           "overseen", "monitored", "tracked", "traced", "followed", "pursued", "chased",
                           "hunted", "sought", "searched", "looked for", "explored", "investigated",
                           "examined", "inspected", "scrutinized", "analyzed", "evaluated", "assessed",
                           "appraised", "valued", "priced", "costed", "budgeted", "forecasted", "projected",
                           "predicted", "estimated", "approximated", "guessed", "assumed", "presumed",
                           "supposed", "believed", "thought", "considered", "deemed", "judged", "decided",
                           "determined", "resolved", "concluded", "inferred", "deduced", "derived",
                           "calculated", "computed", "counted", "enumerated", "listed", "itemized",
                           "detailed", "specified", "defined", "described", "explained", "clarified",
                           "elucidated", "illuminated", "enlightened", "educated", "informed", "notified",
                           "advised", "counseled", "guided", "directed", "instructed", "taught", "trained",
                           "coached", "mentored", "tutored", "facilitated", "enabled", "empowered",
                           "strengthened", "reinforced", "fortified", "bolstered", "boosted", "enhanced",
                           "improved", "upgraded", "updated", "modernized", "renovated", "refurbished",
                           "restored", "repaired", "fixed", "mended", "corrected", "rectified", "remedied",
                           "resolved", "solved", "settled", "finalized", "completed", "finished", "ended",
                           "concluded", "terminated", "closed", "shut", "sealed", "locked", "secured",
                           "protected", "safeguarded", "shielded", "defended", "guarded", "watched",
                           "observed", "noticed", "spotted", "detected", "discovered", "found", "located",
                           "identified", "recognized", "acknowledged", "admitted", "confessed", "disclosed",
                           "revealed", "exposed", "uncovered", "unveiled", "unmasked", "unfolded",
                           "unraveled", "deciphered", "decoded", "decrypted", "unlocked", "cracked",
                           "hacked", "breached", "penetrated", "infiltrated", "invaded", "intruded",
                           "trespassed", "encroached", "infringed", "violated", "abused", "misused",
                           "exploited", "manipulated", "maneuvered", "engineered", "orchestrated",
                           "arranged", "organized", "structured", "systematized", "formalized", "standardized",
                           "normalized", "regularized", "equalized", "balanced", "stabilized", "steadied",
                           "firmed", "strengthened", "solidified", "consolidated", "united", "integrated",
                           "incorporated", "included", "encompassed", "embraced", "covered", "contained",
                           "comprised", "consisted", "constituted", "formed", "shaped", "molded", "crafted",
                           "created", "developed", "designed", "built", "constructed", "erected", "established",
                           "instituted", "founded", "initiated", "started", "begun", "commenced", "launched",
                           "introduced", "presented", "proposed", "suggested", "recommended", "advised",
                           "counseled", "consulted", "conferred", "discussed", "debated", "argued",
                           "disputed", "contested", "challenged", "questioned", "doubted", "suspected",
                           "mistrusted", "distrusted", "disbelieved", "rejected", "refused", "declined",
                           "denied", "negated", "nullified", "invalidated", "voided", "canceled", "revoked",
                           "withdrawn", "retracted", "recanted", "disavowed", "disclaimed", "renounced",
                           "relinquished", "surrendered", "yielded", "conceded", "submitted", "succumbed",
                           "capitulated", "gave in", "gave up", "quit", "stopped", "ceased", "desisted",
                           "refrained", "abstained", "avoided", "evaded", "escaped", "eluded", "dodged",
                           "sidestepped", "circumvented", "bypassed", "skipped", "omitted", "excluded",
                           "excepted", "exempted", "spared", "saved", "rescued", "recovered", "retrieved",
                           "reclaimed", "recouped", "regained", "restored", "reinstated", "reestablished",
                           "reintroduced", "reinserted", "reincorporated", "reintegrated", "reunited",
                           "reconciled", "harmonized", "synchronized", "coordinated", "collaborated",
                           "cooperated", "participated", "contributed", "donated", "gave", "offered",
                           "provided", "supplied", "furnished", "equipped", "outfitted", "fitted", "suited",
                           "matched", "paired", "coupled", "linked", "connected", "joined", "united",
                           "combined", "merged", "fused", "integrated", "incorporated", "assimilated",
                           "absorbed", "consumed", "devoured", "eaten", "ingested", "digested", "processed",
                           "handled", "managed", "dealt with", "coped with", "tackled", "addressed",
                           "confronted", "faced", "encountered", "met", "experienced", "underwent",
                           "suffered", "endured", "tolerated", "withstood", "resisted", "opposed",
                           "countered", "counteracted", "neutralized", "nullified", "negated", "canceled",
                           "offset", "balanced", "equalized", "leveled", "evened", "smoothed", "flattened",
                           "straightened", "aligned", "adjusted", "calibrated", "tuned", "optimized",
                           "maximized", "minimized", "reduced", "decreased", "diminished", "lessened",
                           "lowered", "dropped", "fell", "declined", "depreciated", "devalued", "deflated",
                           "contracted", "shrank", "compressed", "condensed", "concentrated", "intensified",
                           "strengthened", "reinforced", "fortified", "bolstered", "boosted", "enhanced",
                           "augmented", "amplified", "magnified", "enlarged", "expanded", "extended",
                           "stretched", "lengthened", "widened", "broadened", "deepened", "heightened",
                           "elevated", "raised", "lifted", "hoisted", "hiked", "increased", "grew",
                           "multiplied", "proliferated", "propagated", "spread", "disseminated", "distributed",
                           "allocated", "apportioned", "assigned", "allotted", "granted", "awarded",
                           "bestowed", "conferred", "presented", "gifted", "donated", "contributed",
                           "subscribed", "pledged", "committed", "devoted", "dedicated", "consecrated",
                           "sanctified", "blessed", "hallowed", "revered", "venerated", "worshipped",
                           "adored", "loved", "cherished", "treasured", "valued", "prized", "esteemed",
                           "respected", "honored", "admired", "appreciated", "recognized", "acknowledged",
                           "credited", "attributed", "ascribed", "assigned", "imputed", "charged", "accused",
                           "blamed", "faulted", "criticized", "condemned", "denounced", "censured",
                           "reprimanded", "rebuked", "admonished", "reproached", "reproved", "chastised",
                           "castigated", "punished", "penalized", "fined", "charged", "taxed", "levied",
                           "assessed", "evaluated", "appraised", "valued", "priced", "quoted", "bid",
                           "tendered", "offered", "proposed", "suggested", "recommended", "advised",
                           "counseled", "guided", "directed", "steered", "piloted", "navigated", "charted",
                           "mapped", "plotted", "planned", "scheduled", "programmed", "arranged", "organized",
                           "coordinated", "synchronized", "harmonized", "reconciled", "settled", "resolved",
                           "solved", "fixed", "remedied", "rectified", "corrected", "amended", "modified",
                           "altered", "changed", "varied", "diversified", "differentiated", "distinguished",
                           "discriminated", "separated", "segregated", "isolated", "quarantined", "confined",
                           "restricted", "limited", "constrained", "restrained", "controlled", "regulated",
                           "governed", "ruled", "reigned", "presided", "administered", "managed", "directed",
                           "supervised", "overseen", "monitored", "watched", "observed", "witnessed",
                           "beheld", "viewed", "saw", "looked", "gazed", "stared", "glared", "glanced",
                           "glimpsed", "peeked", "peered", "squinted", "scrutinized", "examined", "inspected",
                           "checked", "verified", "validated", "confirmed", "affirmed", "asserted", "declared",
                           "stated", "said", "told", "mentioned", "cited", "quoted", "referenced", "alluded",
                           "referred", "pointed", "indicated", "signaled", "signified", "denoted", "connoted",
                           "implied", "inferred", "suggested", "hinted", "intimated", "insinuated", "implied",
                           "implicated", "involved", "included", "incorporated", "integrated", "assimilated",
                           "absorbed", "merged", "combined", "united", "joined", "linked", "connected",
                           "associated", "affiliated", "allied", "partnered", "collaborated", "cooperated",
                           "coordinated", "synchronized", "harmonized", "reconciled", "settled", "resolved",
                           "concluded", "finished", "completed", "ended", "terminated", "ceased", "stopped",
                           "halted", "paused", "suspended", "interrupted", "discontinued", "abandoned",
                           "forsaken", "deserted", "left", "departed", "exited", "vacated", "evacuated",
                           "escaped", "fled", "retreated", "withdrew", "retired", "receded", "regressed",
                           "reverted", "returned", "restored", "reinstated", "reestablished", "revived",
                           "resuscitated", "resurrected", "reincarnated", "reborn", "renewed", "refreshed",
                           "rejuvenated", "regenerated", "revitalized", "reinvigorated", "reenergized",
                           "recharged", "refueled", "replenished", "restocked", "resupplied", "refilled",
                           "replenished", "restocked", "resupplied", "refilled", "replenished", "restocked"];
    
    // If none of the finance keywords are found in the query, it's likely a non-finance query
    let isFinanceRelated = false;
    for (const keyword of financeKeywords) {
      if (normalizedQuery.includes(keyword)) {
        isFinanceRelated = true;
        break;
      }
    }
    
    // Check if the query is likely a finance question even without explicit finance keywords
    // Look for question patterns about financial advice, planning, or recommendations
    const financeQuestionPatterns = [
      "how to", "what should", "which is better", "is it good", "should i", "can i", "will it",
      "when to", "where to", "why should", "how much", "how many", "what is the best", "what are the",
      "how do i", "what happens", "what if", "is there", "are there", "can you explain", "tell me about",
      "explain", "advice", "recommend", "suggestion", "opinion", "thoughts", "view", "perspective",
      "guidance", "help", "assist", "support", "plan", "strategy", "approach", "method", "way", "means",
      "technique", "tactic", "procedure", "process", "system", "framework", "structure", "model",
      "pattern", "template", "format", "standard", "benchmark", "target", "goal", "objective", "aim",
      "purpose", "mission", "vision", "value", "principle", "ethics", "morals", "integrity", "honesty",
      "transparency", "accountability", "responsibility", "liability", "obligation", "commitment",
      "pledge", "promise", "assurance", "guarantee", "warranty", "indemnity", "protection", "security",
      "safety", "risk", "hazard", "danger", "threat", "vulnerability", "exposure", "coverage", "hedge",
      "diversification", "allocation", "distribution", "spread", "concentration", "focus", "specialization",
      "niche", "segment", "sector", "industry", "domain", "field", "area", "zone", "region", "territory",
      "jurisdiction", "authority", "power", "control", "influence", "impact", "effect", "result", "outcome",
      "output", "input", "throughput", "productivity", "efficiency", "effectiveness", "performance",
      "quality", "quantity", "volume", "size", "scale", "scope", "range", "extent", "limit", "boundary",
      "constraint", "restriction", "condition", "term", "stipulation", "provision", "clause", "article",
      "section", "chapter", "part", "division", "unit", "component", "element", "factor", "variable",
      "parameter", "metric", "measure", "indicator", "index", "ratio", "proportion", "percentage", "rate",
      "frequency", "duration", "period", "interval", "gap", "space", "distance", "proximity", "vicinity",
      "neighborhood", "locality", "location", "place", "position", "site", "venue", "address", "contact",
      "detail", "information", "data", "fact", "figure", "statistic", "number", "amount", "quantity", "sum",
      "total", "aggregate", "cumulative", "collective", "combined", "consolidated", "integrated", "unified",
      "harmonized", "synchronized", "coordinated", "aligned", "matched", "paired", "coupled", "linked",
      "connected", "associated", "related", "affiliated", "allied", "partnered", "collaborated",
      "cooperated", "coordinated", "synergized", "leveraged", "utilized", "employed", "applied",
      "implemented", "executed", "performed", "conducted", "carried out", "undertaken", "accomplished",
      "achieved", "attained", "realized", "fulfilled", "satisfied", "met", "exceeded", "surpassed",
      "outperformed", "outshined", "outdone", "beaten", "defeated", "won", "gained", "earned", "acquired",
      "obtained", "procured", "secured", "ensured", "guaranteed", "warranted", "certified", "verified",
      "validated", "confirmed", "approved", "endorsed", "sanctioned", "authorized", "permitted", "allowed",
      "granted", "conceded", "yielded", "surrendered", "relinquished", "abandoned", "forsaken", "deserted",
      "left", "departed", "exited", "withdrawn", "retired", "resigned", "quit", "stopped", "ceased",
      "halted", "paused", "suspended", "interrupted", "disrupted", "disturbed", "interfered", "hindered",
      "hampered", "impeded", "obstructed", "blocked", "barred", "banned", "prohibited", "forbidden",
      "restricted", "limited", "constrained", "confined", "contained", "controlled", "regulated", "governed",
      "managed", "administered", "supervised", "overseen", "monitored", "tracked", "traced", "followed",
      "pursued", "chased", "hunted", "sought", "searched", "looked for", "explored", "investigated",
      "examined", "inspected", "scrutinized", "analyzed", "evaluated", "assessed", "appraised", "valued",
      "priced", "costed", "budgeted", "forecasted", "projected", "predicted", "estimated", "approximated",
      "guessed", "assumed", "presumed", "supposed", "believed", "thought", "considered", "deemed",
      "judged", "decided", "determined", "resolved", "concluded", "inferred", "deduced", "derived",
      "calculated", "computed", "counted", "enumerated", "listed", "itemized", "detailed", "specified",
      "defined", "described", "explained", "clarified", "elucidated", "illuminated", "enlightened",
      "educated", "informed", "notified", "advised", "counseled", "guided", "directed", "instructed",
      "taught", "trained", "coached", "mentored", "tutored", "facilitated", "enabled", "empowered"
    ];
    
    // Check if the query contains any finance question patterns
    for (const pattern of financeQuestionPatterns) {
      if (normalizedQuery.includes(pattern)) {
        // If it contains a question pattern, it might be a finance question even without explicit keywords
        // In this case, we'll let it pass through to the AI for further processing
        isFinanceRelated = true;
        break;
      }
    }
    
    // Only return non_finance_query if we're confident it's not finance-related
    if (!isFinanceRelated && normalizedQuery.length > 5) {
      return "non_finance_query";
    }
  }
  
  // Check for finance-related intents
  trainingData.forEach(item => {
    // Skip non_finance_query intent as we've already checked it
    if (item.intent === "non_finance_query") return;
    
    // Check each example in the intent
    item.examples.forEach(example => {
      const exampleLower = example.toLowerCase();
      
      // Simple matching algorithm - can be improved with NLP techniques
      if (normalizedQuery === exampleLower) {
        // Exact match
        if (1 > bestMatch.score) {
          bestMatch = { intent: item.intent, score: 1 };
        }
      } else if (normalizedQuery.includes(exampleLower)) {
        // Contains the example
        if (0.8 > bestMatch.score) {
          bestMatch = { intent: item.intent, score: 0.8 };
        }
      } else if (exampleLower.includes(normalizedQuery)) {
        // Query is part of an example
        if (0.6 > bestMatch.score) {
          bestMatch = { intent: item.intent, score: 0.6 };
        }
      }
      
      // Check for word overlap
      const queryWords = normalizedQuery.split(' ');
      const exampleWords = exampleLower.split(' ');
      const commonWords = queryWords.filter(word => exampleWords.includes(word));
      
      if (commonWords.length > 0) {
        const overlapScore = 0.5 * (commonWords.length / Math.max(queryWords.length, exampleWords.length));
        if (overlapScore > bestMatch.score) {
          bestMatch = { intent: item.intent, score: overlapScore };
        }
      }
    });
  });
  
  return bestMatch.intent;
}

// Function to get response for a given intent
function getResponse(intent) {
  const intentData = trainingData.find(item => item.intent === intent);
  return intentData ? intentData.response : null;
}

// Example usage of the training data
function processQuery(query) {
  const intent = findIntent(query);
  if (intent) {
    return getResponse(intent);
  } else {
    return "I'm sorry, I don't have specific information about that. Please ask me about savings, investments, budgeting, credit scores, tax saving, or emergency funds.";
  }
}

// Export the training data and helper functions
module.exports = {
  trainingData,
  findIntent,
  getResponse,
  processQuery
};