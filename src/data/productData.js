import car1 from "../assests/images/car1.jpg";
import car2 from "../assests/images/car2.jpg";
import car3 from "../assests/images/car3.jpg"
import car4 from "../assests/images/car4.jpg";
import bike1 from "../assests/images/bike1.jpg";
import bike2 from "../assests/images/bike2.jpg";
import bike3 from "../assests/images/bike3.jpg";
import bike4 from "../assests/images/bike4.jpg";
import speaker1 from "../assests/images/speaker1.jpg";
import speaker2 from "../assests/images/speaker2.jpg";
import speaker3 from "../assests/images/speaker3.jpg";
import speaker4 from "../assests/images/speaker4.jpg";

// Slider data for featured products
export const sliderData = [
    {
        id: 0,
        img: car4,
        text: "Latest addition: Hycross - Travel King size",
    },
    {
        id: 1,
        img: bike1,
        text: "Roam Like a King with Bullet 350",
    },
    {
        id: 2,
        img: speaker2,
        text: "Unleash the Party with JBL Karaoke Speaker",
    },
];

// Store data for all products
export const storeData = [
    {
        id: 1,
        image: car1,
        name: "Ji-Wagon-R",
        description: "Travel In Comfort",
        type: "4-seater",
        availableColors: ["Black", "Blue", "White"],
        pricePerDay: 700,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very comfortable ride, loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for family trips.",
              date: "2024-10-12",
            },
          ],
    },
    {
        id: 2,
        image: car2,
        name: "Swift Dzire",
        description: "Travel In Style",
        type: "4-seater",
        availableColors: ["Black", "Blue", "White", "Green"],
        pricePerDay: 800,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very comfortable ride, loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for family trips.",
              date: "2024-10-12",
            },
          ],
    },
    {
        id: 3,
        image: car3,
        name: "Ertiga",
        description: "Travel In Comfort and enjoy the drive",
        type: "7-seater",
        availableColors: ["Black", "Blue", "White"],
        pricePerDay: 1000,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very comfortable ride, loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for family trips.",
              date: "2024-10-12",
            },
          ],
    },
    {
        id: 4,
        image: car4,
        name: "Hycross",
        description: "Travel King size",
        type: "7-seater",
        availableColors: ["Black", "Blue", "White"],
        pricePerDay: 1000,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very comfortable ride, loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for family trips.",
              date: "2024-10-12",
            },
          ],
    },
    {
        id: 5,
        image: bike1,
        name: "Bullet 350",
        description: "Roam Like King",
        type: "2-wheeler, 2-seater",
        availableColors: ["Black", "Brown", "Dark Green", "White"],
        pricePerDay: 600,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very comfortable ride, loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for long trips.",
              date: "2024-10-12",
            },
          ],
    },
    {
        id: 6,
        image: bike2,
        name: "DIO",
        description: "Zoom through the road",
        type: "2-wheeler, 2-seater",
        availableColors: ["Black", "Brown", "Dark Green", "White", "Orange"],
        pricePerDay: 400,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very comfortable ride, loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for long trips.",
              date: "2024-10-12",
            },
          ],
    },
    {
        id: 7,
        image: bike3,
        name: "Activa",
        description: "The all-time classic",
        type: "2-wheeler, 2-seater",
        availableColors: ["Black", "Brown", "Dark Green", "White", "Mix shades"],
        pricePerDay: 400,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very comfortable ride, loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for long trips.",
              date: "2024-10-12",
            },
          ],
    },
    {
        id: 8,
        image: bike4,
        name: "Aether",
        description: "Go green and silent",
        type: "2-wheeler, 2-seater",
        availableColors: ["Black", "Brown", "Dark Green", "White"],
        pricePerDay: 500,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very comfortable ride, loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for long trips.",
              date: "2024-10-12",
            },
          ],
    },
    {
        id: 9,
        image: speaker1,
        name: "JBL",
        description: "Party mode on",
        type: "Party Speaker",
        availableColors: ["Black"],
        pricePerDay: 600,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very loud speaker loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for vibing",
              date: "2024-10-12",
            },
          ],
    },
    {
        id: 10,
        image: speaker2,
        name: "JBL with Karaoke",
        description: "Let your inner singer out",
        type: "Party Speaker",
        availableColors: ["Black", "Red"],
        pricePerDay: 650,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very loud speaker loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for vibing",
              date: "2024-10-12",
            },
          ],
        
    },
    {
        id: 11,
        image: speaker3,
        name: "Sound Plus",
        description: "Party on the move",
        type: "Portable Party Speaker",
        availableColors: ["Black", "Blue"],
        pricePerDay: 600,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very loud speaker loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for vibing",
              date: "2024-10-12",
            },
          ],
    },
    {
        id: 12,
        image: speaker4,
        name: "Boat",
        description: "Partyyyy",
        type: "Party Speaker with Karaoke",
        availableColors: ["Black", "Blue"],
        pricePerDay: 650,
        reviews: [
            {
              username: "Alice",
              rating: 4,
              comment: "Very loud speaker loved it!",
              date: "2024-10-10",
            },
            {
              username: "Bob",
              rating: 5,
              comment: "Perfect for vibing",
              date: "2024-10-12",
            },
          ],
    },
];

// Defining categories for products
const categories = {
    car: "cars",
    bike: "bikes",
    speaker: "speakers",
};

// Transforming the storeData
export const transformedStoreData = storeData.map(product => ({
    id: product.id,
    title: product.name,
    price: product.pricePerDay,
    description: product.description,
    category: categories[product.type.includes('wheeler') ? 'bike' : product.type.includes('seater') ? 'car' : 'speaker'], // Infer category based on type
    image: product.image,
    reviews:product.reviews,
}));

// Example of how the transformed data would look
console.log(transformedStoreData);
