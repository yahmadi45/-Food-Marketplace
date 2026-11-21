import { expect, test } from '@playwright/test';

test('home page shows restaurants from the API', async ({ page }) => {
  await page.route('**/api/restaurants/cuisine-types', async (route) => {
    await route.fulfill({ json: ['Japonaise'] });
  });
  await page.route('**/api/restaurants?**', async (route) => {
    await route.fulfill({ json: [{ id: 1, nom: 'Sushi Zen', description: 'Sushis frais', image: '', type_cuisine: 'Japonaise', note_moyenne: '4.80', adresse: 'La Marsa', temps_livraison_estime: 25 }] });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /les bonnes tables/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sushi Zen' })).toBeVisible();
  await expect(page.getByText('1 restaurant disponible')).toBeVisible();
});

test('search filter updates the API request and empty state can clear filters', async ({ page }) => {
  await page.route('**/api/restaurants/cuisine-types', async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/api/restaurants?**', async (route) => {
    if (route.request().url().includes('q=pizza')) {
      await route.fulfill({ json: [] });
    } else {
      await route.fulfill({ json: [{ id: 1, nom: 'Sushi Zen', description: 'Sushis frais', image: '', type_cuisine: 'Japonaise', note_moyenne: '4.80', adresse: 'La Marsa', temps_livraison_estime: 25 }] });
    }
  });

  await page.goto('/');
  await page.getByLabel('Rechercher un restaurant').fill('pizza');
  await expect(page.getByText('Aucun restaurant trouvé')).toBeVisible();
  await page.getByRole('button', { name: 'Effacer les filtres' }).click();
  await expect(page.getByRole('heading', { name: 'Sushi Zen' })).toBeVisible();
});
