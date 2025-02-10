import { faker } from "@faker-js/faker";
import neo4j from "neo4j-driver";
import crypto from "crypto";

// Initialize Faker with multiple locales
faker.locale = "en";

// Configuration
const NEO4J_URI = "neo4j://localhost:7687";
const NEO4J_USER = "neo4j";
const NEO4J_PASSWORD = "kjod876fytf";
const TOTAL_USERS = 500;

// Cities and their coordinates
const CITIES = {
  Khouribga: { x: -6.9081, y: 32.877 },
  Fes: { x: -5.0033, y: 34.0333 },
  Casablanca: { x: -7.5898, y: 33.5731 },
  Tangier: { x: -5.8129, y: 35.7595 },
  Settat: { x: -7.6166, y: 32.9833 }
};

// Interests
const INTERESTS = [
  "#Photography",
  "#Shopping",
  "#Karaoke",
  "#Yoga",
  "#Cooking",
  "#Tennis",
  "#Art",
  "#Traveling",
  "#Music",
  "#Gaming",
  "#Swimming",
  "#Running",
  "#Painting",
  "#Drawing",
  "#Sculpture",
  "#Poetry",
  "#Writing",
  "#Theater",
  "#Dance",
  "#Museums"
];

class PhotoManager {
  constructor() {
    this.photos = {
      male: [
        "https://res.cloudinary.com/dx7tysdmi/image/upload/v1739194190/dtchc1tjaq9odrgdolvk.jpg",
        "https://images.pexels.com/photos/30472381/pexels-photo-30472381/free-photo-of-elegant-male-fashion-portrait-with-moody-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/10479493/pexels-photo-10479493.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/16457464/pexels-photo-16457464/free-photo-of-bearded-man-wearing-eyeglasses.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/3760258/pexels-photo-3760258.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/16973769/pexels-photo-16973769/free-photo-of-portrait-of-a-laughing-man.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30587051/pexels-photo-30587051/free-photo-of-portrait-of-a-mature-mechanic-in-a-dimly-lit-garage.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30612850/pexels-photo-30612850/free-photo-of-outdoor-portrait-of-a-man-relaxing-on-swing-in-abuja.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30602305/pexels-photo-30602305/free-photo-of-portrait-of-a-man-in-traditional-attire-outdoors.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30630920/pexels-photo-30630920/free-photo-of-urban-fashion-portrait-of-pensive-man.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/6147211/pexels-photo-6147211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30644130/pexels-photo-30644130/free-photo-of-stylish-portrait-of-a-man-in-hooded-sweatshirt.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30629084/pexels-photo-30629084/free-photo-of-young-man-in-casual-attire-on-metro-stairway.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/28314088/pexels-photo-28314088/free-photo-of-a-man-in-a-blue-shirt-and-glasses-standing-in-front-of-a-building.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30623852/pexels-photo-30623852/free-photo-of-moody-portrait-of-youth-in-urban-fashion.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/6976091/pexels-photo-6976091.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30630789/pexels-photo-30630789/free-photo-of-vintage-style-portrait-with-old-cassette-player.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30299380/pexels-photo-30299380/free-photo-of-man-in-black-coat-leaning-against-tree-in-fall.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/17077069/pexels-photo-17077069/free-photo-of-birds-eye-view-of-motorboat.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/30446427/pexels-photo-30446427/free-photo-of-stylish-man-in-suit-posing-on-rocky-terrain.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/29580987/pexels-photo-29580987/free-photo-of-elderly-man-walking-in-tokyo-neighborhood.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/29690236/pexels-photo-29690236/free-photo-of-contemplative-man-in-red-light-portrait.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",

        "https://images.pexels.com/photos/30158553/pexels-photo-30158553/free-photo-of-stylish-young-adult-in-trendy-denim-outfit.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",

      ],
      female: [
        "https://images.pexels.com/photos/30549701/pexels-photo-30549701/free-photo-of-smiling-woman-in-traditional-red-costume.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/3808041/pexels-photo-3808041.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30644453/pexels-photo-30644453/free-photo-of-young-woman-posing-in-sunlit-field-at-sunset.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30632766/pexels-photo-30632766/free-photo-of-black-and-white-portrait-of-a-young-woman.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30618599/pexels-photo-30618599/free-photo-of-woman-with-tattoo-standing-against-beige-wall.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/2787341/pexels-photo-2787341.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30546313/pexels-photo-30546313/free-photo-of-elegant-woman-in-ao-dai-with-umbrella-at-japanese-bridge.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30607031/pexels-photo-30607031/free-photo-of-woman-in-green-ao-dai-at-historic-fortress.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30572883/pexels-photo-30572883/free-photo-of-tranquil-portrait-by-a-lake-in-ankara.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30531850/pexels-photo-30531850/free-photo-of-woman-in-traditional-dress-holding-flowers.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30644194/pexels-photo-30644194/free-photo-of-woman-in-front-of-iconic-hagia-sophia-in-istanbul.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/29069494/pexels-photo-29069494/free-photo-of-elegant-young-woman-in-sparkling-red-gown-indoors.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/14356738/pexels-photo-14356738.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/17593640/pexels-photo-17593640/free-photo-of-soup-with-egg.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/30555720/pexels-photo-30555720/free-photo-of-dramatic-portrait-of-woman-in-red-lighting.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",

        "https://images.pexels.com/photos/27305813/pexels-photo-27305813/free-photo-of-a-woman-taking-a-photo-with-her-camera.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://www.pexels.com/photo/relaxed-woman-lying-on-white-bed-indoors-30561139/",
        "https://images.pexels.com/photos/30356749/pexels-photo-30356749/free-photo-of-woman-in-hat-gazing-at-seaside-horizon.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/30254788/pexels-photo-30254788/free-photo-of-cozy-autumn-dalgona-coffee-and-open-book-scene.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/30385813/pexels-photo-30385813/free-photo-of-elegant-woman-in-black-dress-in-moroccan-interior.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/30492157/pexels-photo-30492157/free-photo-of-cozy-reading-moment-with-coffee-and-books.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/30189620/pexels-photo-30189620/free-photo-of-white-and-gray-cat-on-tree-in-sunlight.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/30537429/pexels-photo-30537429/free-photo-of-thoughtful-young-woman-in-orchard-during-fall.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/30454607/pexels-photo-30454607/free-photo-of-floral-beauty-portrait-with-vibrant-blooms.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/30461878/pexels-photo-30461878/free-photo-of-elegant-afro-inspired-portrait-with-vintage-fashion.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/7327767/pexels-photo-7327767.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/30338194/pexels-photo-30338194/free-photo-of-elegant-black-and-white-fashion-portrait.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",

        "https://images.pexels.com/photos/30309982/pexels-photo-30309982/free-photo-of-woman-holding-camera-at-sunset-beach.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/16486458/pexels-photo-16486458/free-photo-of-woman-wearing-earmuffs-on-winter-day.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",

        "https://images.pexels.com/photos/30441185/pexels-photo-30441185/free-photo-of-traditional-chinese-attire-with-scarlet-umbrella-in-jakarta.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
        "https://images.pexels.com/photos/30253418/pexels-photo-30253418/free-photo-of-elegant-woman-in-flowing-dress-in-forest-setting.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"

      ]
    };
  }

  async ensurePhotos(gender, needed) {
    const photos = this.photos[gender] || [];
    if (photos.length === 0) return Array(needed).fill("");
    return Array.from(
      { length: needed },
      () => photos[Math.floor(Math.random() * photos.length)]
    );
  }
}

class UserGenerator {
  constructor(photoManager) {
    this.photoManager = photoManager;
  }

  generatePasswordHash() {
    return `$argon2id$v=19$m=65536,t=3,p=4$${crypto
      .randomBytes(20)
      .toString("hex")}$${crypto.randomBytes(32).toString("hex")}`;
  }

  generateUserInterests() {
    const count = Math.floor(Math.random() * 6) + 5; // 5-10 interests
    return INTERESTS.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  async generateUser(index) {
    const gender = Math.random() < 0.5 ? "male" : "female";
    const cityNames = Object.keys(CITIES);
    const city = cityNames[Math.floor(Math.random() * cityNames.length)];
    const coords = CITIES[city];

    const x = coords.x + (Math.random() * 0.01 - 0.005);
    const y = coords.y + (Math.random() * 0.01 - 0.005);

    const photos = await this.photoManager.ensurePhotos(gender, 1);
    const profilePic = photos.length > 0 ? photos[0] : "";

    return {
      username: `user_${crypto
        .createHash("md5")
        .update(index.toString())
        .digest("hex")
        .substring(0, 8)}`,
      email: faker.internet.email(),
      password: this.generatePasswordHash(),
      first_name:
        gender === "male"
          ? faker.person.firstName("male")
          : faker.person.firstName("female"),
      last_name: faker.person.lastName(),
      age: Math.floor(Math.random() * 3) + 18, // 18-20
      gender: gender,
      city: city,
      country: "Morocco",
      biography: faker.lorem.sentence(20),
      profile_picture: profilePic,
      pics: [profilePic, profilePic, profilePic, profilePic, profilePic],
      interests: this.generateUserInterests(),
      x: x,
      y: y,
      setup_done: true,
      verified: true,
      is_logged: Math.random() < 0.5,
      fame_rating: Math.floor(Math.random() * 101)
    };
  }
}

class DatabaseManager {
  constructor() {
    this.driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
    );
  }

  async populateDatabase(userGenerator) {
    const session = this.driver.session();

    try {
      console.log("Clearing existing database...");
      await session.run("MATCH (n) DETACH DELETE n");

      console.log(`Generating ${TOTAL_USERS} users...`);
      for (let i = 0; i < TOTAL_USERS; i++) {
        const user = await userGenerator.generateUser(i);

        // Create user node
        await session.run(
          `
                    CREATE (u:User {
                        username: $username,
                        email: $email,
                        password: $password,
                        first_name: $first_name,
                        last_name: $last_name,
                        age: $age,
                        gender: $gender,
                        city: $city,
                        country: $country,
                        city_WTK: $city,
                        country_WTK: $country,
                        biography: $biography,
                        location_WTK: point({latitude: $y, longitude: $x}),
                        location: point({latitude: $y, longitude: $x}),
                        profile_picture: $profile_picture,
                        pics: $pics,
                        setup_done: $setup_done,
                        verified: $verified,
                        is_logged: $is_logged,
                        fame_rating: $fame_rating,
                        notifications: []
                    })
                `,
          user
        );

        // Create interests relationships
        for (const interest of user.interests) {
          await session.run(
            `
                        MATCH (u:User {username: $username})
                        MERGE (t:Tags {interests: $interest})
                        MERGE (u)-[:has_this_interest]->(t)
                    `,
            { username: user.username, interest }
          );
        }

        if ((i + 1) % 10 === 0) {
          console.log(`Progress: ${i + 1}/${TOTAL_USERS} users created`);
        }
      }

      await this.printStatistics(session);
    } finally {
      await session.close();
    }
  }

  async printStatistics(session) {
    const userCount = await session.run(
      "MATCH (u:User) RETURN count(u) as count"
    );
    const tagCount = await session.run(
      "MATCH (t:Tags) RETURN count(t) as count"
    );
    const relCount = await session.run(
      "MATCH ()-[r:has_this_interest]->() RETURN count(r) as count"
    );

    console.log("\nDatabase Statistics:");
    console.log(`Total Users: ${userCount.records[0].get("count")}`);
    console.log(`Total Unique Interests: ${tagCount.records[0].get("count")}`);
    console.log(
      `Total Interest Relationships: ${relCount.records[0].get("count")}`
    );
  }

  close() {
    return this.driver.close();
  }
}

async function main() {
  console.log("Starting database population process...");
  try {
    const photoManager = new PhotoManager();
    const userGenerator = new UserGenerator(photoManager);
    const dbManager = new DatabaseManager();

    await dbManager.populateDatabase(userGenerator);
    dbManager.close();

    console.log("Database population completed successfully!");
  } catch (e) {
    console.error("Fatal error:", e);
    process.exit(1);
  }
}

main().catch(console.error);
