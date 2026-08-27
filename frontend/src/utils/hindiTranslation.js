/**
 * Comprehensive Hindi Translation Dictionary & Natural Culinary Engine for RecipeAI
 */

// ── 1. Comprehensive Clean Ingredient Dictionary (English -> Hindi) ──────────
export const INGREDIENT_DICT = {
  // Meats & Seafood
  "chicken": "चिकन",
  "chicken thighs": "चिकन थाई",
  "chicken breast": "चिकन ब्रेस्ट",
  "chicken breasts": "चिकन ब्रेस्ट",
  "chicken pieces": "चिकन के टुकड़े",
  "ground chicken": "चिकन कीमा",
  "grilled chicken": "ग्रिल्ड चिकन",
  "chicken wings": "चिकन विंग्स",
  "boneless chicken": "बोनलेस चिकन",
  "mutton": "मटन",
  "beef": "बीफ",
  "ground beef": "बीफ कीमा",
  "fish": "मछली",
  "salmon": "सैल्मन मछली",
  "salmon fillets": "सैल्मन मछली के टुकड़े",
  "prawns": "झींगा",
  "shrimp": "झींगा",
  "pancetta": "पैनसेटा",
  "bacon": "बेकन",
  "guanciale": "ग्वानचाले",
  "anchovy fillets": "एन्कोवी मछली",

  // Dairy & Paneer
  "paneer": "पनीर",
  "cottage cheese": "पनीर",
  "milk": "दूध",
  "full-fat milk": "फुल-क्रीम दूध",
  "skim milk": "टोन्ड दूध",
  "almond milk": "बादाम का दूध",
  "soy milk": "सोया दूध",
  "oat milk": "ओट मिल्क",
  "coconut milk": "नारियल का दूध",
  "heavy cream": "क्रीम (मलाई)",
  "fresh cream": "ताजी क्रीम",
  "cream": "क्रीम (मलाई)",
  "sour cream": "खट्टी क्रीम",
  "butter": "मक्खन",
  "unsalted butter": "बिना नमक का मक्खन",
  "melted butter": "पिघला हुआ मक्खन",
  "ghee": "देसी घी",
  "clarified butter": "देसी घी",
  "yogurt": "दही",
  "plain yogurt": "सादा दही",
  "dahi": "दही",
  "curd": "दही",
  "greek yogurt": "ग्रीक दही",
  "cheese": "चीज़",
  "parmesan": "परमेसन चीज़",
  "pecorino": "पेकोरिनो चीज़",
  "pecorino romano": "पेकोरिनो चीज़",
  "mozzarella": "मोज़ेरेला चीज़",
  "fresh mozzarella": "ताजा मोज़ेरेला चीज़",
  "cheddar": "चेडर चीज़",
  "feta": "फेटा चीज़",
  "feta cheese": "फेटा चीज़",
  "ricotta": "रिकोटा चीज़",
  "mascarpone": "मस्करपोने चीज़",
  "shredded cheese": "कद्दूकस की हुई चीज़",

  // Vegetables & Aromatics
  "onion": "प्याज",
  "onions": "प्याज",
  "red onion": "लाल प्याज",
  "white onion": "सफेद प्याज",
  "green onion": "हरा प्याज",
  "green onions": "हरे प्याज",
  "spring onion": "हरा प्याज",
  "spring onions": "हरे प्याज",
  "shallots": "छोटे प्याज",
  "garlic": "लहसुन",
  "garlic cloves": "लहसुन की कलियां",
  "garlic clove": "लहसुन की कली",
  "ginger": "अदरक",
  "fresh ginger": "ताजा अदरक",
  "ginger-garlic paste": "अदरक-लहसुन का पेस्ट",
  "tomato": "टमाटर",
  "tomatoes": "टमाटर",
  "crushed tomatoes": "पिसे हुए टमाटर",
  "tomato puree": "टमाटर की प्यूरी",
  "tomato purée": "टमाटर की प्यूरी",
  "tomato passata": "टमाटर प्यूरी (पासाता)",
  "tomato paste": "टमाटर का पेस्ट",
  "cherry tomatoes": "चेरी टमाटर",
  "potato": "आलू",
  "potatoes": "आलू",
  "spinach": "पालक",
  "fresh spinach": "ताजा पालक",
  "palak": "पालक",
  "cauliflower": "फूलगोभी",
  "cabbage": "पत्तागोभी",
  "broccoli": "ब्रोकोली",
  "broccoli florets": "ब्रोकोली के टुकड़े",
  "carrot": "गाजर",
  "carrots": "गाजर",
  "green peas": "हरी मटर",
  "peas": "मटर",
  "frozen peas": "मटर",
  "capsicum": "शिमला मिर्च",
  "bell pepper": "शिमला मिर्च",
  "red bell pepper": "लाल शिमला मिर्च",
  "green bell pepper": "हरी शिमला मिर्च",
  "yellow bell pepper": "पीली शिमला मिर्च",
  "chili": "मिर्च",
  "chilies": "मिर्च",
  "green chili": "हरी मिर्च",
  "green chilies": "हरी मिर्च",
  "red chili": "लाल मिर्च",
  "red chilies": "लाल मिर्च",
  "thai chilies": "थाई मिर्च",
  "jalapeño": "हलापीनो मिर्च",
  "mushroom": "मशरूम",
  "mushrooms": "मशरूम",
  "mixed mushrooms": "मशरूम",
  "cucumber": "खीरा",
  "eggplant": "बैंगन",
  "brinjal": "बैंगन",
  "okra": "भिंडी",
  "ladyfinger": "भिंडी",
  "bottle gourd": "लौकी",
  "zucchini": "ज़ुकीनी (तोरी)",
  "beetroot": "चुकंदर",
  "radish": "मूली",
  "corn": "मक्का",
  "sweet corn": "स्वीट कॉर्न",
  "avocado": "एवोकाडो",
  "avocados": "एवोकाडो",
  "ripe avocados": "पके हुए एवोकाडो",
  "lemon": "नींबू",
  "lemon juice": "नींबू का रस",
  "lime": "नींबू",
  "lime juice": "नींबू का रस",
  "bean sprouts": "अंकुरित मूंग/बीन्स",
  "romaine lettuce": "रोमेन लेट्यूस (सलाद पत्ता)",
  "lettuce": "सलाद पत्ता (लेट्यूस)",

  // Herbs
  "coriander": "हरा धनिया",
  "coriander leaves": "ताजा हरा धनिया",
  "fresh coriander": "ताजा हरा धनिया",
  "fresh coriander leaves": "ताजा हरा धनिया",
  "cilantro": "हरा धनिया",
  "fresh cilantro": "ताजा हरा धनिया",
  "mint": "पुदीना",
  "fresh mint": "ताजा पुदीना",
  "fresh mint leaves": "ताजा पुदीना पत्तियां",
  "curry leaves": "कढ़ी पत्ता",
  "bay leaf": "तेजपत्ता",
  "bay leaves": "तेजपत्ता",
  "basil": "तुलसी/बेसिल पत्ती",
  "thai basil": "थाई बेसिल",
  "fresh basil": "ताजा बेसिल",
  "fresh basil leaves": "ताजा बेसिल की पत्तियां",
  "oregano": "ओरेगानो",
  "dried oregano": "सूखा ओरेगानो",
  "thyme": "थाइम",
  "fresh thyme": "ताजा थाइम",
  "rosemary": "रोज़मेरी",
  "parsley": "अजमोद (पार्सले)",
  "fresh parsley": "ताजा पार्सले",
  "dill": "सोया पत्ती (डिल)",
  "fresh dill": "ताजा डिल",
  "chives": "हरी प्याज की पत्तियां",
  "fresh chives": "ताजी चाइव्स",
  "kasuri methi": "कसूरी मेथी",

  // Spices & Seasonings
  "salt": "नमक",
  "sea salt": "समुद्री नमक",
  "black salt": "काला नमक",
  "black pepper": "काली मिर्च",
  "white pepper": "सफेद मिर्च",
  "freshly cracked black pepper": "कुटी हुई काली मिर्च",
  "red chili powder": "लाल मिर्च पाउडर",
  "kashmiri red chili powder": "कश्मीरी लाल मिर्च पाउडर",
  "chili flakes": "कुटी हुई लाल मिर्च",
  "dried chili flakes": "लाल मिर्च फ्लेक्स",
  "turmeric": "हल्दी",
  "turmeric powder": "हल्दी पाउडर",
  "coriander powder": "धनिया पाउडर",
  "cumin": "जीरा",
  "cumin seeds": "जीरा",
  "cumin powder": "जीरा पाउडर",
  "mustard seeds": "राई/सरसों",
  "fenugreek seeds": "मेथी दाना",
  "fennel seeds": "सौंफ",
  "carom seeds": "अजवाइन",
  "asafoetida": "हींग",
  "hing": "हींग",
  "garam masala": "गरम मसाला",
  "chole masala": "छोले मसाला",
  "pav bhaji masala": "पाव भाजी मसाला",
  "chaat masala": "चाट मसाला",
  "biryani masala": "बिरयानी मसाला",
  "rajma masala": "राजमा मसाला",
  "amchur": "आमचूर पाउडर",
  "dry mango powder": "आमचूर पाउडर",
  "anardana": "अनारदाना पाउडर",
  "cardamom": "इलायची",
  "green cardamom": "छोटी हरी इलायची",
  "black cardamom": "बड़ी काली इलायची",
  "cinnamon": "दालचीनी",
  "cinnamon stick": "दालचीनी",
  "cinnamon powder": "दालचीनी पाउडर",
  "cloves": "लौंग",
  "star anise": "चक्र फूल",
  "nutmeg": "जायफल",
  "mace": "जावित्री",
  "saffron": "केसर",
  "sesame seeds": "सफेद तिल",
  "chia seeds": "चिया बीज",
  "paprika": "लाल शिमला मिर्च पाउडर (पेप्रिका)",
  "smoked paprika": "स्मोक्ड पेप्रिका",
  "cayenne pepper": "तीखी लाल मिर्च",
  "italian seasoning": "इटैलियन हर्ब्स",
  "garlic powder": "लहसुन पाउडर",
  "onion powder": "प्याज पाउडर",
  "vanilla extract": "वैनिला एसेंस",
  "baking powder": "बेकिंग पाउडर",
  "baking soda": "बेकिंग सोडा",

  // Grains, Flours & Bakery
  "spaghetti": "स्पेगेटी पास्ता",
  "pasta": "पास्ता",
  "penne": "पेने पास्ता",
  "fettuccine": "फेटुचीनी पास्ता",
  "macaroni": "मैकरोनी",
  "noodles": "नूडल्स",
  "flat rice noodles": "राइस नूडल्स",
  "pizza dough": "पिज़्ज़ा का आटा",
  "rice": "चावल",
  "basmati rice": "बासमती चावल",
  "sushi rice": "सुशी राइस",
  "arborio rice": "आरबोरियो चावल",
  "jasmine rice": "जैस्मिन राइस",
  "brown rice": "ब्राउन राइस",
  "wheat flour": "गेहूं का आटा",
  "all-purpose flour": "मैदा",
  "plain flour": "मैदा",
  "maida": "मैदा",
  "semolina": "सूजी",
  "semolina flour": "सूजी",
  "oats": "ओट्स",
  "rolled oats": "रोल्ड ओट्स",
  "oat flour": "ओट का आटा",
  "cornstarch": "कॉर्नस्टार्च",
  "corn flour": "कॉर्न फ्लोर",
  "bread": "ब्रेड",
  "tortilla": "टॉर्टिला",
  "corn tortillas": "मक्के की टॉर्टिला",
  "small corn tortillas": "छोटी मकई टॉर्टिला",
  "flour tortilla": "मैदा टॉर्टिला",
  "large flour tortilla": "बड़ी टॉर्टिला",
  "naan": "नान",
  "roti": "रोटी",
  "paratha": "पराठा",
  "bhatura": "भटूरा",
  "pav": "पाव",
  "burger buns": "बर्गर बन",
  "croutons": "क्रूटॉन्स",
  "ladyfinger biscuits": "लेडीफिंगर बिस्कुट",

  // Lentils, Beans & Protein
  "toor dal": "अरहर (तूर) दाल",
  "moong dal": "मूंग दाल",
  "urad dal": "उड़द दाल",
  "chana dal": "चना दाल",
  "masoor dal": "मसूर दाल",
  "chickpeas": "काबुली चना",
  "kabuli chana": "काबुली चना",
  "kidney beans": "राजमा",
  "rajma": "राजमा",
  "black beans": "काली बीन्स",
  "tofu": "टोफू",
  "firm tofu": "टोफू",
  "protein powder": "प्रोटीन पाउडर",
  "egg": "अंडा",
  "eggs": "अंडे",
  "egg whites": "अंडे की सफेदी",
  "egg yolks": "अंडे की जर्दी",
  "egg yolk": "अंडे की जर्दी",

  // Nuts, Seeds & Sweeteners
  "almonds": "बादाम",
  "cashews": "काजू",
  "walnuts": "अखरोट",
  "pistachios": "पिस्ता",
  "peanuts": "मूंगफली",
  "roasted peanuts": "भुनी हुई मूंगफली",
  "peanut butter": "पीनट बटर",
  "natural peanut butter": "नेचुरल पीनट बटर",
  "sugar": "चीनी",
  "caster sugar": "पीसी चीनी",
  "brown sugar": "ब्राउन शुगर",
  "palm sugar": "ताड़ की चीनी (पाम शुगर)",
  "jaggery": "गुड़",
  "honey": "शहद",
  "maple syrup": "मेपल सिरप",
  "dark chocolate": "डार्क चॉकलेट",
  "chocolate": "चॉकलेट",
  "cocoa powder": "कोको पाउडर",
  "granola": "ग्रेनोला",

  // Oils & Liquids
  "oil": "तेल",
  "olive oil": "जैतून का तेल (ऑलिव ऑयल)",
  "extra virgin olive oil": "एक्स्ट्रा वर्जिन ऑलिव ऑयल",
  "mustard oil": "सरसों का तेल",
  "coconut oil": "नारियल का तेल",
  "sesame oil": "तिल का तेल",
  "vegetable oil": "कुकिंग ऑयल",
  "water": "पानी",
  "pasta water": "पास्ता का पानी",
  "vegetable stock": "सब्जियों का सूप (वेज स्टॉक)",
  "chicken stock": "चिकन स्टॉक",
  "soy sauce": "सोया सॉस",
  "vinegar": "सिरका",
  "rice vinegar": "राइस विनेगर",
  "fish sauce": "फिश सॉस",
  "oyster sauce": "ऑयस्टर सॉस",
  "tamarind paste": "इमली का पल्प",
  "dijon mustard": "डिजॉन मस्टर्ड",
  "worcestershire sauce": "वॉर्सेस्टरशायर सॉस",
  "caesar dressing": "सीज़र ड्रेसिंग",
  "mayonnaise": "मेयोनेज़",
  "espresso": "एस्प्रेसो कॉफी",
  "strong espresso": "गाढ़ी एस्प्रेसो कॉफी",

  // Fruits
  "banana": "केला",
  "bananas": "केले",
  "ripe banana": "पका हुआ केला",
  "overripe bananas": "पके हुए केले",
  "frozen banana": "जमा हुआ केला",
  "mango": "आम",
  "apple": "सेब",
  "berries": "बेरीज़",
  "strawberries": "स्ट्रॉबेरी",
  "blueberries": "ब्लूबेरी",
  "frozen mixed berries": "मिक्स बेरीज़",
  "pomegranate seeds": "अनार दाना"
};

// ── 2. Units & Quantities (English -> Hindi) ──────────────────────────────────
export const UNIT_DICT = {
  "tbsp": "बड़ा चम्मच",
  "tablespoon": "बड़ा चम्मच",
  "tablespoons": "बड़े चम्मच",
  "tsp": "छोटा चम्मच",
  "teaspoon": "छोटा चम्मच",
  "teaspoons": "छोटे चम्मच",
  "cup": "कप",
  "cups": "कप",
  "g": "ग्राम",
  "gram": "ग्राम",
  "grams": "ग्राम",
  "kg": "किलोग्राम",
  "ml": "मिलीलीटर",
  "liter": "लीटर",
  "liters": "लीटर",
  "pinch": "चुटकी भर",
  "pinches": "चुटकी भर",
  "to taste": "स्वादानुसार",
  "handful": "मुट्ठी भर",
  "slices": "टुकड़े (स्लाइस)",
  "slice": "स्लाइस",
  "piece": "टुकड़ा",
  "pieces": "टुकड़े",
  "clove": "कली",
  "cloves": "कलियां",
  "large": "बड़ा",
  "medium": "मध्यम",
  "small": "छोटा",
  "diced": "कटा हुआ",
  "chopped": "बारीक कटा हुआ",
  "sliced": "कटा हुआ",
  "minced": "बारीक पिसा हुआ",
  "grated": "कद्दूकस किया हुआ",
  "mashed": "मैश किया हुआ",
  "boiled": "उबला हुआ",
  "soaked": "भीगा हुआ",
  "crushed": "कुटा हुआ",
  "melted": "पिघला हुआ",
  "fresh": "ताजा",
  "dried": "सूखा",
  "optional": "ऐच्छिक",
  "for cooking": "पकाने के लिए",
  "for frying": "तलने के लिए",
  "to garnish": "सजाने के लिए",
  "to serve": "परोसने के लिए"
};

// ── 3. Comprehensive Step Translation Catalog ─────────────────────────────────
export const STEP_EXACT_MAP = {
  // ── Butter Chicken ──
  "Marinate chicken in yogurt, 1 tsp garam masala, and turmeric for 30 mins.":
    "चिकन को दही, 1 छोटा चम्मच गरम मसाला और हल्दी में 30 मिनट के लिए मैरीनेट करें।",
  "Marinate chicken in yogurt, garam masala, and turmeric for 30 mins.":
    "चिकन को दही, गरम मसाला और हल्दी में 30 मिनट के लिए मैरीनेट करें।",
  "Grill or pan-sear chicken until charred; set aside and cut into chunks.":
    "चिकन को ग्रिल या पैन में सिकने तक भूनें; फिर अलग रखकर टुकड़ों में काट लें।",
  "Grill or pan-sear chicken until charred; set aside.":
    "चिकन को ग्रिल या पैन में सिकने तक भूनें; फिर अलग रख लें।",
  "Melt butter in a pan; sauté onion until golden (8 min).":
    "एक पैन में मक्खन पिघलाएं; प्याज को 8 मिनट तक सुनहरा होने तक भूनें।",
  "Sauté onion in butter until golden. Add garlic and ginger.":
    "पैन में मक्खन गरम करके प्याज को सुनहरा होने तक भूनें। फिर लहसुन और अदरक डालें।",
  "Add garlic and ginger; cook 2 minutes until fragrant.":
    "लहसुन और अदरक डालें; खुशबू आने तक 2 मिनट तक पकाएं।",
  "Add crushed tomatoes and remaining spices; simmer 15 minutes.":
    "पिसे हुए टमाटर और बाकी मसाले डालें; 15 मिनट तक धीमी आंच पर पकने दें।",
  "Add crushed tomatoes and spices; simmer 15 minutes.":
    "पिसे हुए टमाटर और मसाले डालें; 15 मिनट तक धीमी आंच पर पकने दें।",
  "Blend the sauce until smooth, then return to the pan.":
    "सॉस को मिक्सी में पीसकर स्मूथ बना लें, फिर वापस पैन में डालें।",
  "Blend sauce until smooth. Return to pan.":
    "सॉस को मिक्सी में पीसकर स्मूथ बना लें और वापस पैन में डालें।",
  "Add chicken and cream; simmer on low for 10 minutes.":
    "चिकन और क्रीम (मलाई) डालें; धीमी आंच पर 10 मिनट तक पकने दें।",
  "Add chicken and cream; simmer 10 more minutes. Serve with naan.":
    "चिकन और क्रीम डालें; 10 मिनट और धीमी आंच पर पकाएं। नान के साथ परोसें।",
  "Garnish with cream swirl and serve with naan or basmati rice.":
    "ऊपर से थोड़ी क्रीम डालें और नान या बासमती चावल के साथ गरमा-गरम परोसें।",

  // ── Paneer Butter Masala ──
  "Heat 1 tbsp butter in a pan. Lightly fry paneer cubes until golden on each side. Remove and set aside.":
    "पैन में 1 चम्मच मक्खन गरम करें। पनीर के टुकड़ों को दोनों तरफ से हल्का सुनहरा होने तक तलें। फिर निकालकर अलग रख लें।",
  "In the same pan, heat remaining butter. Add cumin seeds and let them splutter.":
    "उसी पैन में बाकी मक्खन गरम करें। जीरा डालें और उसे चटकने दें।",
  "Add onions and sauté on medium heat for 8–10 minutes until golden brown.":
    "प्याज डालें और मध्यम आंच पर 8-10 मिनट तक सुनहरा भूरा होने तक भूनें।",
  "Add garlic and ginger; cook 2 minutes until raw smell disappears.":
    "लहसुन और अदरक डालें; कच्चापन खत्म होने तक 2 मिनट भूनें।",
  "Add turmeric, coriander powder, and Kashmiri chili powder; stir for 1 minute.":
    "हल्दी, धनिया पाउडर और कश्मीरी लाल मिर्च पाउडर डालें; 1 मिनट तक चलाएं।",
  "Pour in crushed tomatoes. Simmer on medium heat for 12–15 minutes, stirring occasionally.":
    "टमाटर की प्यूरी डालें। बीच-बीच में चलाते हुए मध्यम आंच पर 12-15 मिनट तक पकाएं।",
  "Let the tomato mixture cool, then blend smooth. Pass through a strainer back into the pan.":
    "टमाटर के मसाले को ठंडा होने दें, फिर मिक्सी में पीसकर छलनी से छानकर वापस पैन में डालें।",
  "Add cream, garam masala, and kasuri methi. Stir to combine.":
    "क्रीम (मलाई), गरम मसाला और कसूरी मेथी डालें। अच्छी तरह मिला लें।",
  "Gently fold in fried paneer cubes. Simmer on low heat for 5 minutes.":
    "तले हुए पनीर के टुकड़े डालें। धीमी आंच पर 5 मिनट तक पकने दें।",
  "Adjust salt and serve hot with naan, roti, or basmati rice.":
    "स्वादानुसार नमक मिलाएं और नान, रोटी या बासमती चावल के साथ गरमा-गरम परोसें।",

  // ── Palak Paneer ──
  "Blanch spinach in boiling salted water for 2 minutes. Immediately transfer to ice water. Drain and blend to a smooth purée.":
    "पालक को उबलते नमकीन पानी में 2 मिनट ब्लांच करें। तुरंत बर्फ वाले ठंडे पानी में डालें, फिर छानकर मिक्सी में पीसकर स्मूथ प्यूरी बना लें।",
  "Heat butter in a pan. Lightly pan-fry paneer cubes until golden. Remove and set aside.":
    "पैन में मक्खन गरम करें। पनीर के टुकड़ों को हल्का सुनहरा होने तक भूनें और अलग रख लें।",
  "In the same pan, add cumin seeds. When they splutter, add onions and sauté until golden (8 mins).":
    "उसी पैन में जीरा डालें। चटकने पर प्याज डालें और सुनहरा होने तक (8 मिनट) भूनें।",
  "Add garlic, ginger, and green chili. Cook 2 minutes.":
    "लहसुन, अदरक और हरी मिर्च डालें। 2 मिनट तक पकाएं।",
  "Add chopped tomatoes, coriander powder, and garam masala. Cook until tomatoes soften completely.":
    "कटे हुए टमाटर, धनिया पाउडर और गरम मसाला डालें। टमाटर के पूरी तरह गलने तक पकाएं।",
  "Pour in the spinach purée. Stir well and simmer for 5 minutes.":
    "पालक की प्यूरी डालें। अच्छी तरह मिलाएं और 5 मिनट तक धीमी आंच पर पकाएं।",
  "Add paneer cubes. Gently mix and cook on low for 3–4 minutes.":
    "पनीर के टुकड़े डालें। हल्के हाथों से मिलाएं और धीमी आंच पर 3-4 मिनट पकाएं।",
  "Stir in fresh cream. Adjust salt and serve with naan or jeera rice.":
    "ताजी क्रीम मिलाएं। स्वादानुसार नमक डालकर नान या जीरा राइस के साथ परोसें।",

  // ── Dal Tadka ──
  "Pressure cook toor dal with 2.5 cups water, turmeric, and salt for 4–5 whistles. Mash gently and set aside.":
    "तूर दाल को 2.5 कप पानी, हल्दी और नमक के साथ कुकर में 4-5 सीटी आने तक पकाएं। हल्का मैश करके अलग रख लें।",
  "Heat 2 tbsp ghee in a pan. Sauté onions until golden brown (8–10 minutes).":
    "पैन में 2 बड़े चम्मच घी गरम करें। प्याज को 8-10 मिनट सुनहरा भूरा होने तक भूनें।",
  "Add garlic, ginger, and green chilies. Cook 2 minutes.":
    "लहसुन, अदरक और हरी मिर्च डालें। 2 मिनट तक भूनें।",
  "Add chopped tomatoes, red chili powder. Cook until tomatoes are soft and oil separates.":
    "कटे हुए टमाटर और लाल मिर्च पाउडर डालें। टमाटर गलने और तेल छोड़ने तक पकाएं।",
  "Pour cooked dal into the masala. Add water to desired consistency. Simmer 10 minutes.":
    "पकी हुई दाल को मसाले में डालें। जरूरत के अनुसार पानी मिलाकर 10 मिनट तक धीमी आंच पर पकाएं।",
  "For tadka: heat 1 tbsp ghee in a small pan. Add cumin seeds, mustard seeds, and dried red chilies.":
    "तड़के के लिए: एक छोटे पैन में 1 चम्मच घी गरम करें। जीरा, राई और सूखी लाल मिर्च डालें।",
  "When seeds splutter, add sliced garlic and cook until golden. Pour tadka over the dal.":
    "मसाले चटकने पर कटा लहसुन डालें और सुनहरा होने तक भूनें। इस तड़के को दाल के ऊपर डालें।",
  "Add garam masala, garnish with fresh coriander, and serve with rice or roti.":
    "गरम मसाला डालें, ऊपर से ताजा हरा धनिया सजाएं और चावल या रोटी के साथ परोसें।",

  // ── Aloo Gobi ──
  "Heat oil in a large pan. Add cumin seeds; let them splutter.":
    "एक बड़े पैन में तेल गरम करें। जीरा डालें और उसे चटकने दें।",
  "Add onions and sauté on medium heat until translucent (5–6 minutes).":
    "प्याज डालें और मध्यम आंच पर 5-6 मिनट नरम होने तक भूनें।",
  "Add chopped tomatoes and all spices except garam masala. Cook until oil separates (6–8 minutes).":
    "कटे हुए टमाटर और गरम मसाला छोड़कर बाकी सभी मसाले डालें। तेल अलग होने तक (6-8 मिनट) पकाएं।",
  "Add potato cubes. Toss to coat with masala. Cover and cook 5 minutes.":
    "आलू के टुकड़े डालें और मसाले के साथ मिलाएं। ढककर 5 मिनट पकाएं।",
  "Add cauliflower florets. Mix gently. Cover and cook on low heat 12–15 minutes, stirring occasionally.":
    "फूलगोभी के टुकड़े डालें। धीरे से मिलाएं और ढककर धीमी आंच पर 12-15 मिनट पकाएं।",
  "Remove lid, add garam masala, and cook uncovered 2 minutes to dry out any moisture.":
    "ढक्कन हटाएं, गरम मसाला डालें और बिना ढके 2 मिनट पकाएं ताकि अतिरिक्त नमी सूख जाए।",
  "Garnish with fresh coriander and serve hot with roti or paratha.":
    "ताजा हरा धनिया डालकर सजाएं और गरमा-गरम रोटी या पराठे के साथ परोसें।",

  // ── Chicken Biryani ──
  "Marinate chicken with yogurt, ginger-garlic paste, biryani masala for 1 hour.":
    "चिकन को दही, अदरक-लहसुन का पेस्ट और बिरयानी मसाला के साथ 1 घंटे के लिए मैरीनेट करें।",
  "Fry sliced onions in ghee until deep golden; drain half for garnish.":
    "घी में कटे हुए प्याज को गहरा सुनहरा होने तक तलें; आधा प्याज गार्निश के लिए निकाल लें।",
  "Cook marinated chicken in the remaining onions until 80% done.":
    "बचे हुए प्याज में मैरीनेट किया हुआ चिकन 80% पकने तक पकाएं।",
  "Parboil rice with whole spices and salt until 70% cooked; drain.":
    "खड़े मसालों और नमक के साथ बासमती चावल को 70% तक उबालें; फिर पानी छान लें।",
  "Layer rice over chicken in a heavy pot.":
    "एक भारी बर्तन में चिकन के ऊपर चावल की परत लगाएं।",
  "Sprinkle saffron milk, mint, coriander, and fried onions on top.":
    "ऊपर से केसर वाला दूध, पुदीना, हरा धनिया और तले हुए प्याज डालें।",
  "Seal with a tight lid (or foil) and cook on dum (low heat) 25 minutes.":
    "बर्तन को ढक्कन या फॉयल से अच्छी तरह सील करें और 25 मिनट तक धीमी आंच पर दम दें।",
  "Gently mix before serving with raita.":
    "परोसने से पहले हल्के हाथों से मिलाएं और रायते के साथ परोसें।",

  // ── Spaghetti Carbonara ──
  "Cook spaghetti in well-salted boiling water until al dente; reserve 1 cup pasta water.":
    "उबलते नमकीन पानी में स्पेगेटी को अल डेंटे (नरम) होने तक पकाएं; 1 कप पास्ता का पानी अलग रख लें।",
  "Cook spaghetti in salted boiling water until al dente.":
    "उबलते नमकीन पानी में स्पेगेटी को अल डेंटे होने तक पकाएं।",
  "Meanwhile, fry pancetta over medium heat until crispy; remove from heat.":
    "इस बीच, मध्यम आंच पर पैनसेटा/बेकन को कुरकुरा होने तक भूनें; फिर आंच से उतार लें।",
  "Whisk egg yolks with pecorino, parmesan, and black pepper in a bowl.":
    "एक कटोरे में अंडे की जर्दी, पेकोरिनो, परमेसन चीज़ और कुटी हुई काली मिर्च को अच्छी तरह फेंटें।",
  "Add ¼ cup hot pasta water to egg mixture and whisk to temper.":
    "अंडे के मिश्रण में ¼ कप गर्म पास्ता का पानी डालें और अच्छी तरह फेंटकर मिलाएं।",
  "Add hot drained pasta to the pancetta pan (off heat).":
    "छने हुए गर्म पास्ता को पैनसेटा वाले पैन में डालें (आंच बंद रखकर)।",
  "Pour egg mixture over pasta; toss vigorously, adding pasta water to create a creamy sauce.":
    "पास्ता के ऊपर अंडे का मिश्रण डालें; लगातार हिलाते हुए मिलाएं और पास्ता का पानी डालकर मलाईदार सॉस तैयार करें।",
  "Serve immediately with extra pecorino and black pepper.":
    "ऊपर से अतिरिक्त पेकोरिनो चीज़ और काली मिर्च डालकर तुरंत गरमा-गरम परोसें।",

  // ── Margherita Pizza ──
  "Preheat oven to 250°C (480°F) with a pizza stone or baking tray inside.":
    "ओवन को पिज़्ज़ा स्टोन या बेकिंग ट्रे के साथ 250°C पर पहले से प्रीहीट कर लें।",
  "Mix passata with garlic, olive oil, salt and pepper for the sauce.":
    "सॉस के लिए टमाटर प्यूरी, लहसुन, ऑलिव ऑयल, नमक और काली मिर्च को अच्छी तरह मिलाएं।",
  "Stretch dough on a semolina-dusted surface to ~30cm circle.":
    "सूजी छिड़की हुई सतह पर पिज़्ज़ा डो को लगभग 30 सेमी गोल आकार में फैलाएं।",
  "Spread sauce evenly, leaving a 2cm border.":
    "किनारों पर 2 सेमी छोड़कर बाकी पूरे बेस पर सॉस को समान रूप से फैलाएं।",
  "Scatter torn mozzarella over the sauce.":
    "सॉस के ऊपर मोज़ेरेला चीज़ के टुकड़े फैलाएं।",
  "Slide onto the hot stone and bake 10–12 minutes until crust is golden.":
    "गरम ओवन स्टोन पर डालें और क्रस्ट सुनहरा होने तक 10-12 मिनट बेक करें।",
  "Remove from oven, add fresh basil and a drizzle of olive oil.":
    "ओवन से निकालें, ऊपर से ताजा बेसिल की पत्तियां और थोड़ा ऑलिव ऑयल डालकर परोसें।",

  // ── Pancakes ──
  "Whisk flour, baking powder, baking soda, salt, and sugar in a bowl.":
    "एक कटोरे में मैदा, बेकिंग पाउडर, बेकिंग सोडा, नमक और चीनी को एक साथ मिलाएं।",
  "In another bowl, whisk buttermilk, eggs, melted butter, and vanilla.":
    "दूसरे कटोरे में बटरमिल्क (या दूध), अंडे, पिघला हुआ मक्खन और वैनिला एसेंस फेंटें।",
  "Pour wet into dry ingredients; stir until just combined (lumps are fine).":
    "गीले मिश्रण को सूखे मिश्रण में डालें; बस हल्का मिलाएं (हल्की गांठें रह सकती हैं)।",
  "Rest batter 5 minutes.":
    "घोल को 5 मिनट के लिए रख दें।",
  "Heat a non-stick pan over medium heat; melt a small knob of butter.":
    "नॉन-स्टिक पैन को मध्यम आंच पर गरम करें और थोड़ा सा मक्खन लगाएं।",
  "Pour ¼ cup batter per pancake; cook until bubbles appear (2–3 min), then flip.":
    "प्रति पैनकेक ¼ कप घोल डालें; बुलबुले आने तक (2-3 मिनट) पकाएं, फिर पलट दें।",
  "Cook 1–2 minutes more until golden; serve with maple syrup.":
    "दूसरी तरफ से भी सुनहरा होने तक 1-2 मिनट पकाएं; मेपल सिरप या शहद के साथ परोसें।",

  // ── Banana Peanut Butter Protein Pancakes ──
  "Mash bananas in a large bowl until smooth with no large lumps.":
    "एक बड़े कटोरे में पके हुए केलों को बिना गांठ रहे अच्छी तरह मैश कर लें।",
  "Add eggs, peanut butter, and vanilla extract. Whisk together.":
    "अंडे, पीनट बटर और वैनिला एसेंस डालें। सब कुछ अच्छी तरह फेंटें।",
  "Add oat flour (or blended oats), protein powder, baking powder, cinnamon, and salt. Stir gently until just combined.":
    "ओट का आटा, प्रोटीन पाउडर, बेकिंग पाउडर, दालचीनी और नमक डालें। चिकना घोल बनने तक मिलाएं।",
  "Let batter rest 3–4 minutes to thicken. If too thick, add 1–2 tbsp milk.":
    "घोल को 3-4 मिनट गाढ़ा होने दें। यदि बहुत गाढ़ा लगे तो 1-2 चम्मच दूध मिलाएं।",
  "Heat a non-stick pan over medium-low heat. Brush with a little coconut oil.":
    "नॉन-स्टिक पैन को धीमी-मध्यम आंच पर गरम करें और हल्का सा नारियल तेल लगाएं।",
  "Pour ¼ cup batter per pancake. Cook 2–3 minutes until bubbles form on top and edges look set.":
    "पैनकेक के लिए ¼ कप घोल डालें। ऊपर बुलबुले बनने और किनारे सेट होने तक 2-3 मिनट पकाएं।",
  "Flip carefully and cook another 2 minutes until golden.":
    "सावधानी से पलटें और दूसरी तरफ से भी सुनहरा होने तक 2 मिनट पकाएं।",
  "Stack pancakes and top with sliced bananas, berries, and a drizzle of honey or maple syrup.":
    "पैनकेक की परत लगाएं, ऊपर केले के टुकड़े, बेरीज़ और शहद या मेपल सिरप डालकर परोसें।"
};

// ── 4. Intelligent Rule-Based Step Translator ──────────────────────────────────
export function translateStep(stepText) {
  if (!stepText) return "";
  const text = stepText.trim();

  // 1. Direct exact lookup
  if (STEP_EXACT_MAP[text]) {
    return STEP_EXACT_MAP[text];
  }

  // 2. Pattern Matching Rules for natural Hindi sentences
  const patterns = [
    // Marination
    {
      regex: /^Marinate (.*?) in (.*?) for (\d+)\s*(?:mins|minutes|min|hours|hrs)\.?$/i,
      replacer: (_, item, marinade, time) =>
        `${translatePhrase(item)} को ${translatePhrase(marinade)} में ${time} मिनट के लिए मैरीनेट करें।`
    },
    // Grilling / Searing
    {
      regex: /^Grill or pan-sear (.*?) until (?:charred|golden|cooked through);?\s*(?:set aside and (.*))?\.?$/i,
      replacer: (_, item, rest) =>
        `${translatePhrase(item)} को सिकने/सुनहरा होने तक ग्रिल या पैन में भूनें${rest ? `; फिर ${translatePhrase(rest)}` : ' और अलग रख लें।'}`
    },
    // Melting & sautéing
    {
      regex: /^Melt (.*?) in a pan;?\s*saut[eé] (.*?) until (?:golden|soft|translucent)(?: \((\d+)\s*min\))?\.?$/i,
      replacer: (_, fat, veggies, time) =>
        `पैन में ${translatePhrase(fat)} पिघलाएं; ${translatePhrase(veggies)} को ${time ? `${time} मिनट तक ` : ''}सुनहरा होने तक भूनें।`
    },
    // Adding aromatics
    {
      regex: /^Add (?:garlic and ginger|ginger and garlic|ginger-garlic paste);?\s*cook (\d+)\s*(?:minutes?|mins?) until (?:fragrant|raw smell disappears)\.?$/i,
      replacer: (_, time) =>
        `लहसुन और अदरक डालें; खुशबू आने तक ${time} मिनट तक पकाएं।`
    },
    // Adding tomatoes / sauces & simmering
    {
      regex: /^Add (.*?) and (?:remaining )?spices;?\s*simmer (\d+)\s*(?:minutes?|mins?)\.?$/i,
      replacer: (_, item, time) =>
        `${translatePhrase(item)} और मसाले डालें; ${time} मिनट तक धीमी आंच पर पकने दें।`
    },
    // Blending sauce
    {
      regex: /^Blend (?:the )?sauce until smooth,?\s*(?:then )?return to (?:the )?pan\.?$/i,
      replacer: () =>
        "सॉस को मिक्सी में पीसकर स्मूथ बना लें, फिर वापस पैन में डालें।"
    },
    // Simmering with cream
    {
      regex: /^Add (.*?) and (?:cream|milk);?\s*simmer (?:on low )?for (\d+)\s*(?:more )?(?:minutes?|mins?)\.?$/i,
      replacer: (_, item, time) =>
        `${translatePhrase(item)} और क्रीम डालें; धीमी आंच पर ${time} मिनट तक पकने दें।`
    },
    // Garnish and serve
    {
      regex: /^Garnish with (.*?) and serve (?:hot )?with (.*?)\.?$/i,
      replacer: (_, garnish, accompaniment) =>
        `${translatePhrase(garnish)} से सजाएं और ${translatePhrase(accompaniment)} के साथ गरमा-गरम परोसें।`
    },
    // Heat fat
    {
      regex: /^Heat (\d+)\s*(?:tbsp|tsp)?\s*(butter|oil|ghee) in a (?:pan|pot|skillet|wok)\.?/i,
      replacer: (_, amt, fat) =>
        `एक पैन में ${amt} बड़ा चम्मच ${translatePhrase(fat)} गरम करें।`
    },
    // Pressure cooking
    {
      regex: /^Pressure cook (.*?) for (\d+)–(\d+) whistles until (?:soft|cooked)\.?/i,
      replacer: (_, item, w1, w2) =>
        `कुकर में ${translatePhrase(item)} को ${w1}-${w2} सीटी आने तक अच्छी तरह पकाएं।`
    },
    // Boiling pasta/water
    {
      regex: /^Cook (.*?) in (?:well-salted|salted) boiling water until al dente;?\s*(?:reserve (.*) pasta water)?\.?$/i,
      replacer: (_, item, res) =>
        `उबलते नमकीन पानी में ${translatePhrase(item)} को अल डेंटे होने तक पकाएं${res ? `; ${res} पास्ता का पानी अलग रख लें।` : '।'}`
    }
  ];

  for (const { regex, replacer } of patterns) {
    const match = text.match(regex);
    if (match) {
      return replacer(...match);
    }
  }

  // 3. Fallback: Clean sentence translation
  return translateFallbackSentence(text);
}

/**
 * Translate a phrase/clause cleanly into Hindi
 */
function translatePhrase(phrase) {
  if (!phrase) return "";
  let p = phrase.trim();

  // Replace common ingredients
  for (const [en, hi] of Object.entries(INGREDIENT_DICT)) {
    const reg = new RegExp(`\\b${en}\\b`, "gi");
    p = p.replace(reg, hi);
  }

  // Replace units
  for (const [uEn, uHi] of Object.entries(UNIT_DICT)) {
    const reg = new RegExp(`\\b${uEn}\\b`, "gi");
    p = p.replace(reg, uHi);
  }

  // Common phrase connectors
  p = p
    .replace(/\band\b/gi, "और")
    .replace(/\bwith\b/gi, "के साथ")
    .replace(/\bfor\b/gi, "के लिए")
    .replace(/\bin\b/gi, "में")
    .replace(/\bor\b/gi, "या")
    .replace(/\bto\b/gi, "को")
    .replace(/\bcut into chunks\b/gi, "टुकड़ों में काट लें")
    .replace(/\bset aside\b/gi, "अलग रख लें");

  return p;
}

/**
 * Intelligent fallback that converts English cooking sentences to natural Hindi
 */
function translateFallbackSentence(sentence) {
  let s = sentence.trim();

  // Split multiple clauses by semicolon or period
  const clauses = s.split(/;\s*/);
  if (clauses.length > 1) {
    return clauses.map(c => translateFallbackSentence(c)).join("; ");
  }

  // Replace ingredients
  for (const [en, hi] of Object.entries(INGREDIENT_DICT)) {
    const reg = new RegExp(`\\b${en}\\b`, "gi");
    s = s.replace(reg, hi);
  }

  // Replace units
  for (const [uEn, uHi] of Object.entries(UNIT_DICT)) {
    const reg = new RegExp(`\\b${uEn}\\b`, "gi");
    s = s.replace(reg, uHi);
  }

  // Verb & Action transformations (English -> Hindi)
  s = s
    .replace(/\bheat\b/gi, "गरम करें")
    .replace(/\bboil\b/gi, "उबालें")
    .replace(/\bcook\b/gi, "पकाएं")
    .replace(/\bfry\b/gi, "भूनें")
    .replace(/\bsaut[eé]\b/gi, "भूनें")
    .replace(/\bwhisk\b/gi, "फेंटें")
    .replace(/\bmix\b/gi, "मिलाएं")
    .replace(/\bstir\b/gi, "चलाएं")
    .replace(/\bserve hot\b/gi, "गरमा-गरम परोसें")
    .replace(/\bserve immediately\b/gi, "तुरंत परोसें")
    .replace(/\bserve\b/gi, "परोसें")
    .replace(/\badd\b/gi, "डालें")
    .replace(/\bgarnish with\b/gi, "सजाएं")
    .replace(/\buntil golden brown\b/gi, "सुनहरा भूरा होने तक")
    .replace(/\buntil golden\b/gi, "सुनहरा होने तक")
    .replace(/\buntil fragrant\b/gi, "खुशबू आने तक")
    .replace(/\buntil tender\b/gi, "नरम होने तक")
    .replace(/\buntil soft\b/gi, "गलने तक")
    .replace(/\bon medium heat\b/gi, "मध्यम आंच पर")
    .replace(/\bon low heat\b/gi, "धीमी आंच पर")
    .replace(/\bon high heat\b/gi, "तेज आंच पर")
    .replace(/\bmeanwhile\b/gi, "इस बीच")
    .replace(/\bminutes?\b/gi, "मिनट")
    .replace(/\bmins?\b/gi, "मिनट")
    .replace(/\bseconds?\b/gi, "सेकंड")
    .replace(/\bhours?\b/gi, "घंटे")
    .replace(/\band\b/gi, "और")
    .replace(/\bwith\b/gi, "के साथ")
    .replace(/\bfor\b/gi, "तक")
    .replace(/\bin a (?:pan|pot|bowl)\b/gi, "एक बर्तन में")
    .replace(/\bto taste\b/gi, "स्वादानुसार");

  // Ensure sentence ends with Devanagari full stop (।) or period
  if (!s.endsWith("।") && !s.endsWith(".")) {
    s += "।";
  } else if (s.endsWith(".")) {
    s = s.slice(0, -1) + "।";
  }

  return s;
}

// ── 5. Ingredient Translator ──────────────────────────────────────────────────
export function translateIngredient(ing) {
  if (!ing) return { name: "", amount: "", note: "" };
  const name = typeof ing === "string" ? ing : (ing.name || "");
  const amount = typeof ing === "string" ? "" : (ing.amount || "");
  const note = typeof ing === "string" ? "" : (ing.note || "");

  const lowerName = name.toLowerCase().trim();
  let hiName = INGREDIENT_DICT[lowerName];
  if (!hiName) {
    let trans = name;
    for (const [enKey, hiVal] of Object.entries(INGREDIENT_DICT)) {
      const reg = new RegExp(`\\b${enKey}\\b`, "gi");
      trans = trans.replace(reg, hiVal);
    }
    hiName = trans;
  }

  let hiAmount = amount;
  if (hiAmount) {
    for (const [uKey, uVal] of Object.entries(UNIT_DICT)) {
      const reg = new RegExp(`\\b${uKey}\\b`, "gi");
      hiAmount = hiAmount.replace(reg, uVal);
    }
  }

  let hiNote = note;
  if (hiNote) {
    for (const [uKey, uVal] of Object.entries(UNIT_DICT)) {
      const reg = new RegExp(`\\b${uKey}\\b`, "gi");
      hiNote = hiNote.replace(reg, uVal);
    }
    for (const [enKey, hiVal] of Object.entries(INGREDIENT_DICT)) {
      const reg = new RegExp(`\\b${enKey}\\b`, "gi");
      hiNote = hiNote.replace(reg, hiVal);
    }
  }

  return {
    name: hiName || name,
    amount: hiAmount,
    note: hiNote
  };
}

// ── 6. Recipe Description & Title Localization ────────────────────────────────
export function getLocalizedRecipe(recipe, lang = "en") {
  if (!recipe) return null;

  const localizedIngredients = (recipe.ingredients || []).map(ing => {
    const rawName = typeof ing === "string" ? ing : (ing.name || "");
    const rawAmount = typeof ing === "string" ? "" : (ing.amount || "");
    const rawNote = typeof ing === "string" ? "" : (ing.note || "");
    const hi = translateIngredient(ing);

    return {
      enName: rawName,
      enAmount: rawAmount,
      enNote: rawNote,
      hiName: hi.name,
      hiAmount: hi.amount,
      hiNote: hi.note,
      name: lang === "hi" ? hi.name : rawName,
      amount: lang === "hi" ? hi.amount : rawAmount,
      note: lang === "hi" ? hi.note : rawNote
    };
  });

  const localizedSteps = (recipe.steps || []).map(step => {
    const enText = typeof step === "string" ? step : (step.en || step.text || "");
    const hiText = typeof step === "object" && step.hi ? step.hi : translateStep(enText);
    return {
      en: enText,
      hi: hiText,
      text: lang === "hi" ? hiText : enText
    };
  });

  let hiDesc = recipe.description || "";
  for (const [enKey, hiVal] of Object.entries(INGREDIENT_DICT)) {
    const reg = new RegExp(`\\b${enKey}\\b`, "gi");
    hiDesc = hiDesc.replace(reg, hiVal);
  }

  return {
    ...recipe,
    title: recipe.title,
    enDescription: recipe.description,
    hiDescription: hiDesc,
    description: lang === "hi" ? (hiDesc || recipe.description) : recipe.description,
    ingredients: localizedIngredients,
    steps: localizedSteps,
    rawSteps: recipe.steps,
    isHindi: lang === "hi"
  };
}

// ── 7. Web Speech API (Text-to-Speech) ────────────────────────────────────────
let currentUtterance = null;

export function speakRecipeText(text, lang = "en", onEnd = () => {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("Speech synthesis is not supported in this browser.");
    onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  if (!text || !text.trim()) {
    onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text.trim());
  currentUtterance = utterance;

  utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
  utterance.rate = lang === "hi" ? 0.9 : 1.0;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  if (lang === "hi") {
    const hindiVoice = voices.find(v =>
      (v.lang && v.lang.includes("hi")) ||
      (v.name && v.name.toLowerCase().includes("hindi")) ||
      (v.name && v.name.toLowerCase().includes("lekha")) ||
      (v.name && v.name.toLowerCase().includes("neerja"))
    );
    if (hindiVoice) utterance.voice = hindiVoice;
  } else {
    const engVoice = voices.find(v => v.lang && (v.lang.includes("en-IN") || v.lang.includes("en-US")));
    if (engVoice) utterance.voice = engVoice;
  }

  utterance.onend = () => {
    currentUtterance = null;
    onEnd();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}
