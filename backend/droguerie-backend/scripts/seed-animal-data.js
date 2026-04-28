const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'droguerie_db',
    });

    console.log('Connected to MySQL database!');

    try {
        // 1. Categories
        const categories = [
            { name: 'Oiseaux', description: 'Tout pour vos oiseaux', imageUrl: 'https://images.unsplash.com/photo-1552728089-571ebf4eb552?auto=format&fit=crop&q=80&w=400' },
            { name: 'Rongeurs & Souris', description: 'Nourriture et accessoires pour rongeurs', imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd08d9c?auto=format&fit=crop&q=80&w=400' },
            { name: 'Poissons', description: 'Aquariophilie', imageUrl: 'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&q=80&w=400' },
            { name: 'Chiens', description: 'Pour le meilleur ami de l\'homme', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400' },
            { name: 'Chats', description: 'Pour votre félin préféré', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400' }
        ];

        console.log('Inserting categories...');
        const categoryIds = {};
        for (const cat of categories) {
            const [existing] = await connection.execute('SELECT id FROM categories WHERE name = ?', [cat.name]);
            if (existing.length === 0) {
                const [result] = await connection.execute(
                    'INSERT INTO categories (name, description, imageUrl, isActive, createdAt) VALUES (?, ?, ?, ?, NOW())',
                    [cat.name, cat.description, cat.imageUrl, true]
                );
                categoryIds[cat.name] = result.insertId;
            } else {
                categoryIds[cat.name] = existing[0].id;
            }
        }

        // 1.5 Brands
        const brands = [
            { name: 'Royal Canin', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Royal_Canin_logo.svg/1200px-Royal_Canin_logo.svg.png' },
            { name: 'Purina', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Nestle_Purina_PetCare_logo.svg/2560px-Nestle_Purina_PetCare_logo.svg.png' },
            { name: 'Trixie', logo: 'https://www.trixie.de/storage/images/logo.svg' },
            { name: 'Tetra', logo: 'https://www.tetra.net/~/media/Tetra/Logos/tetra_logo.ashx' },
            { name: 'Generic', logo: '' }
        ];

        console.log('Inserting brands...');
        const brandIds = {};
        for (const brand of brands) {
            const [existing] = await connection.execute('SELECT id FROM brands WHERE name = ?', [brand.name]);
            if (existing.length === 0) {
                const [result] = await connection.execute(
                    'INSERT INTO brands (name, logoUrl, isActive, createdAt) VALUES (?, ?, ?, NOW())',
                    [brand.name, brand.logo, true]
                );
                brandIds[brand.name] = result.insertId;
            } else {
                brandIds[brand.name] = existing[0].id;
            }
        }

        // 2. Products
        const products = [
            // Oiseaux
            { name: 'Graines pour Canaris 1kg', price: 5.99, stock: 50, categoryName: 'Oiseaux', brandName: 'Generic', description: 'Mélange de graines équilibré pour canaris.', imageUrl: 'https://images.unsplash.com/photo-1544062828-564560b41196?auto=format&fit=crop&q=80&w=400' },
            { name: 'Cage pour oiseaux Spacieuse', price: 45.00, stock: 15, categoryName: 'Oiseaux', brandName: 'Trixie', description: 'Cage confortable avec perchoirs et mangeoires.', imageUrl: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?auto=format&fit=crop&q=80&w=400' },
            
            // Rongeurs & Souris
            { name: 'Nourriture Complète pour Souris', price: 4.50, stock: 100, categoryName: 'Rongeurs & Souris', brandName: 'Generic', description: 'Granulés riches en nutriments.', imageUrl: 'https://images.unsplash.com/photo-1518796745738-41048802f99a?auto=format&fit=crop&q=80&w=400' },
            { name: 'Roue d\'exercice Silencieuse', price: 8.99, stock: 30, categoryName: 'Rongeurs & Souris', brandName: 'Trixie', description: 'Roue en plastique qui ne grince pas.', imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd08d9c?auto=format&fit=crop&q=80&w=400' },
            
            // Poissons
            { name: 'Flocons pour poissons rouges', price: 3.50, stock: 200, categoryName: 'Poissons', brandName: 'Tetra', description: 'Alimentation quotidienne.', imageUrl: 'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?auto=format&fit=crop&q=80&w=400' },
            { name: 'Aquarium 50 Litres Tout Équipé', price: 80.00, stock: 5, categoryName: 'Poissons', brandName: 'Tetra', description: 'Avec filtre et éclairage LED.', imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be1?auto=format&fit=crop&q=80&w=400' },
            
            // Chiens
            { name: 'Croquettes Premium Chien Adulte 10kg', price: 25.99, stock: 40, categoryName: 'Chiens', brandName: 'Royal Canin', description: 'Haute teneur en protéines.', imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400' },
            { name: 'Collier anti-puces Naturel', price: 15.00, stock: 60, categoryName: 'Chiens', brandName: 'Purina', description: 'Protection jusqu\'à 6 mois.', imageUrl: 'https://images.unsplash.com/photo-1537151608804-ea2f1ea29043?auto=format&fit=crop&q=80&w=400' },
            
            // Chats
            { name: 'Croquettes Chat Stérilisé 5kg', price: 20.00, stock: 50, categoryName: 'Chats', brandName: 'Royal Canin', description: 'Aide à maintenir le poids idéal.', imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400' },
            { name: 'Arbre à chat 1m50', price: 60.00, stock: 10, categoryName: 'Chats', brandName: 'Trixie', description: 'Plusieurs plateformes et griffoirs.', imageUrl: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&q=80&w=400' }
        ];

        console.log('Inserting products...');
        for (const prod of products) {
            const catId = categoryIds[prod.categoryName];
            const brandId = brandIds[prod.brandName] || brandIds['Generic'];
            if (!catId) continue;

            const [existing] = await connection.execute('SELECT id FROM products WHERE name = ?', [prod.name]);
            if (existing.length === 0) {
                await connection.execute(
                    'INSERT INTO products (name, sku, price, stock, categoryId, brandId, description, imageUrl, salesCount, oldPrice, onSale, ecoFriendly, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, null, false, false, ?, NOW(), NOW())',
                    [prod.name, 'SKU-' + Math.random().toString(36).substr(2, 6).toUpperCase(), prod.price, prod.stock, catId, brandId, prod.description, prod.imageUrl, '[]']
                );
            } else {
                // Update brand if product exists but brand is null
                await connection.execute('UPDATE products SET brandId = ? WHERE id = ? AND (brandId IS NULL OR brandId = 0)', [brandId, existing[0].id]);
            }
        }

        // 3. Blogs
        const blogs = [
            {
                title: 'Comment bien nourrir son chat au quotidien',
                slug: 'comment-bien-nourrir-son-chat-au-quotidien',
                category: 'Conseils Chats',
                content: '<h2>L\\\'importance de l\\\'alimentation</h2><p>Un chat bien nourri est un chat en bonne santé. Privilégiez les croquettes de qualité et assurez-vous qu\\\'il ait toujours de l\\\'eau fraîche à disposition.</p>',
                excerpt: 'Découvrez nos conseils pour choisir la meilleure alimentation pour votre chat.',
                imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400'
            },
            {
                title: 'Choisir le bon aquarium pour ses poissons',
                slug: 'choisir-le-bon-aquarium-pour-ses-poissons',
                category: 'Aquariophilie',
                content: '<h2>Les critères de choix</h2><p>La taille de l\\\'aquarium dépend du nombre et de l\\\'espèce de poissons que vous souhaitez élever. N\\\'oubliez pas le filtre et le chauffage si nécessaire.</p>',
                excerpt: 'Tout ce que vous devez savoir avant d\\\'acheter votre premier aquarium.',
                imageUrl: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be1?auto=format&fit=crop&q=80&w=400'
            },
            {
                title: 'L\\\'alimentation des oiseaux domestiques',
                slug: 'alimentation-oiseaux-domestiques',
                category: 'Conseils Oiseaux',
                content: '<h2>Varier les plaisirs</h2><p>Outre les graines, les oiseaux ont besoin de fruits frais, de légumes et parfois d\\\'un os de seiche pour le calcium.</p>',
                excerpt: 'Quels aliments donner à votre oiseau pour qu\\\'il reste en pleine forme ?',
                imageUrl: 'https://images.unsplash.com/photo-1552728089-571ebf4eb552?auto=format&fit=crop&q=80&w=400'
            }
        ];

        console.log('Inserting blogs...');
        for (const blog of blogs) {
            const [existing] = await connection.execute('SELECT id FROM blog_posts WHERE slug = ?', [blog.slug]);
            if (existing.length === 0) {
                await connection.execute(
                    'INSERT INTO blog_posts (title, slug, category, content, excerpt, imageUrl, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                    [blog.title, blog.slug, blog.category, blog.content, blog.excerpt, blog.imageUrl, 'Published']
                );
                console.log(`Added blog: ${blog.title}`);
            } else {
                console.log(`Blog exists: ${blog.title}`);
            }
        }

        console.log('Successfully seeded database with animal categories, products, and blogs!');
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        await connection.end();
    }
}

seed();
