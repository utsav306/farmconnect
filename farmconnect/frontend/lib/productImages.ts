// Collection of random food/agriculture product images for use in the app

interface ImageCollection {
  [key: string]: string[];
}

// Images categorized by product type
export const productImages: ImageCollection = {
  vegetables: [
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655", // potatoes
    "https://images.unsplash.com/photo-1566842600175-97dca3c5ad4e", // bell peppers
    "https://images.unsplash.com/photo-1598511726623-d2e9996e1ddb", // tomatoes
    "https://images.unsplash.com/photo-1576045057995-568f588f82fb", // spinach
    "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c", // broccoli
    "https://images.unsplash.com/photo-1582284540020-8acbe03f4924", // carrots
    "https://images.unsplash.com/photo-1594282486552-05a5f0b67e98", // colorful peppers
    "https://images.unsplash.com/photo-1573246123716-6b1782bfc499", // mixed vegetables
    "https://images.unsplash.com/photo-1590165482129-1b8b27698780", // cucumber
    "https://images.unsplash.com/photo-1615485290382-441e4d049cb5", // eggplant
  ],
  fruits: [
    "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb", // apples
    "https://images.unsplash.com/photo-1490885578174-acda8905c2c6", // strawberries
    "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18", // watermelon
    "https://images.unsplash.com/photo-1553279768-865429fa0078", // mangoes
    "https://images.unsplash.com/photo-1587132137056-bfbf0166836e", // bananas
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655", // oranges
    "https://images.unsplash.com/photo-1620589125156-fd5028c5e05b", // grapes
    "https://images.unsplash.com/photo-1600518665487-14cdb1ae44e5", // pineapple
    "https://images.unsplash.com/photo-1535058314881-56b6e3ade3c5", // dragon fruit
    "https://images.unsplash.com/photo-1527903312100-405c3f3bd221", // blueberries
  ],
  dairy: [
    "https://images.unsplash.com/photo-1550583724-b2692b85b150", // milk
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7", // paneer
    "https://images.unsplash.com/photo-1626957341926-98752fc2ba67", // cheese
    "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05", // eggs
    "https://images.unsplash.com/photo-1584278433313-908b566f303d", // yogurt
    "https://images.unsplash.com/photo-1583252255800-7fac431e8e3a", // butter
  ],
  grains: [
    "https://images.unsplash.com/photo-1586201375761-83865001e8ac", // rice
    "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6", // brown rice
    "https://images.unsplash.com/photo-1574323347407-f5e1c5a1ec21", // wheat
    "https://images.unsplash.com/photo-1600441763908-443e79a0b477", // basmati rice
    "https://images.unsplash.com/photo-1509440159596-0249088772ff", // oats
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8", // quinoa
  ],
  herbs: [
    "https://images.unsplash.com/photo-1591261730569-88a70d4dec16", // basil
    "https://images.unsplash.com/photo-1573414404860-a56425653368", // ginger
    "https://images.unsplash.com/photo-1590677877854-5a319b577ea9", // mint
    "https://images.unsplash.com/photo-1583751636626-8a23ac775268", // turmeric
    "https://images.unsplash.com/photo-1580719734037-6902a508af15", // herbs mix
  ],
};

/**
 * Get random images for a specific product category
 */
export function getRandomImageForCategory(category: string): string {
  const lowerCaseCategory = category.toLowerCase();
  let categoryKey = lowerCaseCategory;

  // Map the category to our image collection keys
  if (lowerCaseCategory === "herbs & spices") categoryKey = "herbs";

  // Get images for the category or use vegetables as fallback
  const images = productImages[categoryKey] || productImages.vegetables;

  // Return a random image from the collection
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * Get a completely random food product image
 */
export function getRandomFoodImage(): string {
  const allCategories = Object.keys(productImages);
  const randomCategory =
    allCategories[Math.floor(Math.random() * allCategories.length)];

  return getRandomImageForCategory(randomCategory);
}
