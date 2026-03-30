(function () {
  const buildPexelsAsset = (id, slug, alt, width = 1200) => ({
    src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`,
    alt,
    source: `https://www.pexels.com/photo/${slug}-${id}/`,
  });

  const normalize = (value = "") =>
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const categoryVisuals = {
    barbering: buildPexelsAsset(
      4625627,
      "barber-cutting-hair",
      "A barber giving a clean haircut in a bright barbershop"
    ),
    braiding: buildPexelsAsset(
      5084511,
      "a-woman-braiding-a-hair",
      "A protective styling session with neat braiding in progress"
    ),
    laundry: buildPexelsAsset(
      8774448,
      "photography-of-washing-machines",
      "A neat self-service laundry room with modern washing machines"
    ),
    "facial care": buildPexelsAsset(
      33580447,
      "makeup-artist-applying-makeup-to-a-woman-in-a-chair",
      "A beauty professional applying makeup during a studio session"
    ),
    "facial artistry": buildPexelsAsset(
      33580447,
      "makeup-artist-applying-makeup-to-a-woman-in-a-chair",
      "A beauty professional applying makeup during a studio session"
    ),
    beauty: buildPexelsAsset(
      7446657,
      "woman-lying-on-spa-bed-with-facial-mask",
      "A client receiving a relaxing facial treatment in a spa"
    ),
    manicure: buildPexelsAsset(
      3997380,
      "anonymous-master-doing-manicure-in-salon",
      "A nail technician performing a manicure at a salon table"
    ),
    tutoring: buildPexelsAsset(
      33913336,
      "woman-studying-with-laptop-and-notebook-at-desk",
      "A student studying with a laptop and notebook at a desk"
    ),
    other: buildPexelsAsset(
      3184465,
      "person-using-macbook-pro",
      "A modern work setup for a campus service professional"
    ),
  };

  const providerVisuals = {
    "ava reed": buildPexelsAsset(
      16030378,
      "portrait-of-a-barber",
      "A professional barber standing in a barbershop"
    ),
    "marcus cole": buildPexelsAsset(
      24035624,
      "portrait-of-a-man-with-an-afro",
      "A confident barber portrait with a modern afro hairstyle"
    ),
    "kwame asante": buildPexelsAsset(
      20607380,
      "portrait-of-a-man-with-afro",
      "A portrait of a man with a neat afro hairstyle"
    ),
    "nia lawson": buildPexelsAsset(
      15576672,
      "a-young-woman-having-her-hair-braided",
      "A young woman having her hair braided during a styling session"
    ),
    "adaeze obi": buildPexelsAsset(
      34191088,
      "close-up-of-textured-braids-on-a-woman",
      "A close-up view of textured braids showing detailed braid work"
    ),
    "jordan stone": buildPexelsAsset(
      7446657,
      "woman-lying-on-spa-bed-with-facial-mask",
      "A client receiving a calming facial treatment"
    ),
    "amara diallo": buildPexelsAsset(
      34930097,
      "professional-esthetician-performing-facial-treatment",
      "A skincare specialist performing a facial treatment"
    ),
    "campus laundry co": buildPexelsAsset(
      7789141,
      "wicker-basket-with-soft-clean-linens-in-light-laundry-room",
      "Freshly folded linens arranged in a laundry basket"
    ),
    freshpress: buildPexelsAsset(
      9462667,
      "a-person-ironing-clothes",
      "A laundry worker ironing clothes on a board"
    ),
    "cleanjoy laundry": buildPexelsAsset(
      5789584,
      "folded-clothes-inside-a-basket",
      "Folded clothes arranged neatly inside a woven basket"
    ),
  };

  const productVisuals = {
    "restorative botanical shampoo": buildPexelsAsset(
      16749129,
      "close-up-of-hand-holding-hair-care-product",
      "A hair care bottle held against a soft neutral background"
    ),
    shampoo: buildPexelsAsset(
      16749129,
      "close-up-of-hand-holding-hair-care-product",
      "A hair care bottle held against a soft neutral background"
    ),
    conditioner: buildPexelsAsset(
      16749129,
      "close-up-of-hand-holding-hair-care-product",
      "A hair care bottle held against a soft neutral background"
    ),
    "premium matte clay": buildPexelsAsset(
      6429633,
      "beauty-product-in-black-glass-jar",
      "A matte black styling jar on a clean product backdrop"
    ),
    clay: buildPexelsAsset(
      6429633,
      "beauty-product-in-black-glass-jar",
      "A matte black styling jar on a clean product backdrop"
    ),
    pomade: buildPexelsAsset(
      6429633,
      "beauty-product-in-black-glass-jar",
      "A matte black styling jar on a clean product backdrop"
    ),
    wax: buildPexelsAsset(
      6429633,
      "beauty-product-in-black-glass-jar",
      "A matte black styling jar on a clean product backdrop"
    ),
    "hydrating face serum": buildPexelsAsset(
      4841353,
      "serum-in-bottle",
      "A skincare serum bottle on a minimal surface"
    ),
    serum: buildPexelsAsset(
      4841353,
      "serum-in-bottle",
      "A skincare serum bottle on a minimal surface"
    ),
    "wool dryer balls": buildPexelsAsset(
      7789141,
      "wicker-basket-with-soft-clean-linens-in-light-laundry-room",
      "Clean folded laundry in a basket inside a bright laundry room"
    ),
    laundry: buildPexelsAsset(
      7789141,
      "wicker-basket-with-soft-clean-linens-in-light-laundry-room",
      "Clean folded laundry in a basket inside a bright laundry room"
    ),
    detergent: buildPexelsAsset(
      7789141,
      "wicker-basket-with-soft-clean-linens-in-light-laundry-room",
      "Clean folded laundry in a basket inside a bright laundry room"
    ),
    manicure: buildPexelsAsset(
      3997380,
      "anonymous-master-doing-manicure-in-salon",
      "A manicure session set up with polished nails and salon tools"
    ),
  };

  const keywordFallbacks = [
    { test: ["barber", "fade", "shave", "line up", "groom"], visual: categoryVisuals.barbering },
    { test: ["braid", "twist", "loc", "cornrow"], visual: categoryVisuals.braiding },
    { test: ["laundry", "wash", "dry", "fold", "press", "clean"], visual: categoryVisuals.laundry },
    { test: ["facial", "skin", "makeup", "beauty", "serum", "glow"], visual: categoryVisuals["facial care"] },
    { test: ["manicure", "nail"], visual: categoryVisuals.manicure },
    { test: ["tutor", "study", "lesson"], visual: categoryVisuals.tutoring },
  ];

  const findKeywordVisual = (value, store) => {
    const normalized = normalize(value);
    const directMatch = Object.keys(store).find((key) => normalized.includes(key));
    if (directMatch) return store[directMatch];

    return keywordFallbacks.find((entry) =>
      entry.test.some((term) => normalized.includes(term))
    )?.visual;
  };

  const resolveCategoryKey = (value = "") => {
    const normalized = normalize(value);
    if (!normalized) return "other";
    if (normalized.includes("barber") || normalized.includes("groom")) return "barbering";
    if (normalized.includes("braid") || normalized.includes("twist") || normalized.includes("loc")) return "braiding";
    if (normalized.includes("laundry") || normalized.includes("wash") || normalized.includes("fold")) return "laundry";
    if (normalized.includes("facial") || normalized.includes("artistry")) return "facial care";
    if (normalized.includes("beauty") || normalized.includes("skin") || normalized.includes("makeup")) return "beauty";
    if (normalized.includes("manicure") || normalized.includes("nail")) return "manicure";
    if (normalized.includes("tutor") || normalized.includes("study")) return "tutoring";
    return "other";
  };

  const resolveCategoryVisual = (value) => categoryVisuals[resolveCategoryKey(value)] || categoryVisuals.other;

  const resolveProviderVisual = ({ name = "", category = "", role = "", description = "" } = {}) => {
    const nameKey = normalize(name);
    if (providerVisuals[nameKey]) return providerVisuals[nameKey];

    return (
      findKeywordVisual([category, role, description, name].join(" "), providerVisuals) ||
      resolveCategoryVisual([category, role, description].join(" "))
    );
  };

  const resolveProductVisual = ({ name = "", category = "", description = "" } = {}) => {
    const combined = [name, category, description].join(" ");
    return (
      findKeywordVisual(combined, productVisuals) ||
      resolveCategoryVisual([category, description].join(" "))
    );
  };

  window.rvMediaLibrary = {
    resolveCategoryVisual,
    resolveProviderVisual,
    resolveProductVisual,
  };
})();
