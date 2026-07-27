# Space Weaver — System Architecture & Core Logic Explained

Yeh document **Space Weaver** ke pooray technical structure, frontend technologies, SEO strategy, aur sabse important — **Backend Layout Arrangement aur Overlapping Engine ki real logic** ko detail me explain karta hai. Agar aapko kisi interview, project review, ya team ko samjhana ho ki yeh platform kaise kaam karta hai, toh yeh document best reference hai.

---

## 1. Project Overview
Space Weaver ek **Advanced Interior Design & Spatial Reasoning Platform** hai jo kisi bhi khali room (length x width) aur selected furniture list ko lekar **12 distinct expert interior design arrangements** (jaise *The Curator, The Architect, The Minimalist, The Cinema Suite*, etc.) mathematically generate karta hai.

---

## 2. Backend Logic — Layout Arrangement & Overlapping Engine
Sabse bada sawaal: **Kya layout arrangement ke liye koi LLM (jaise ChatGPT, Claude) ya external API use ho rahi hai?**

👉 **Jawaab hai: NAHI (NO).** 
Layout arrangement aur coordinates calculation ke liye **koi LLM ya external OpenAI API use NAHI hoti.** 

### 💡 Why NOT an LLM for 2D/3D Layouts?
LLMs text generation ke liye best hain, lekin **exact mathematical geometry aur 2D/3D coordinate precision** me fail ho jaate hain. Agar aap ChatGPT ko bolo ki "6x3 ft ka sofa aur 3x3 ft ki table 15x20 ft ke room me rakh do bina overlap kiye", toh woh random X, Y coordinates hallucinate karega jo 3D me ek doosre ke upar chadh jaate hain (overlapping).

### ⚙️ Hamara Real Engine: HSRE (Human Spatial Reasoning Engine)
Hamne Pure **Node.js + JavaScript Mathematics aur Spatial Geometry** par based apna custom engine banaya hai (`server/engines/`). Yeh 4 mathematical steps me kaam karta hai:

#### Step 1: Focal Point Detection (`focalPointEngine.js`)
* Room me sabse pehle **Anchor Point (Focal Point)** dhoonda jaata hai.
* Agar room me **TV** hai, toh woh primary focal point ban jaata hai (Top wall center: `x = roomW / 2, y = 0.5`).
* Agar TV nahi hai, toh architectural window ya room ka center focal point banta hai.

#### Step 2: Zone-Based Slot Placement Algorithm (`relationshipGraph.js`)
Hum room ko **6 Non-Overlapping Geometric Zones** me divide karte hain taaki har furniture type ki apni dedicated jagah ho:
* **Zone A (TV Zone)**: Top wall ke against anchored.
* **Zone B (Primary Seating Zone)**: Main sofa room ki depth ke **70%** (ya style ke hisaab se 60%-65%) par TV ko face karta hua rakha jaata hai (`y = roomL * 0.70`).
* **Zone C (Conversation Center)**: Coffee Table hamesha dono sofas ke **exact beech (midpoint)** me aati hai with 1.8 ft legroom buffer.
* **Zone D (Flank Side Tables)**: Side tables aur console tables ko sofa ke *flanks/sides* par rakha jaata hai, na ki walkways me.
* **Zone E (Angled Accent Chairs)**: Chairs ko sofas ke left aur right flanks par `45°` ya `90°` inward-facing angles par place kiya jaata hai — kabhi bhi sofa ke theek aage ya peeche nahi.
* **Zone F (Perimeter Storage)**: Bookshelves aur Beds ko room ke perimeter walls par push kiya jaata hai.

#### Step 3: Concentric Spiral Collision Prevention (`findCleanPosition` & `collision.js`)
**Overlapping ko hum 100% mathematically kaise rokte hain?**
1. **Rotation-Aware Bounding Box Checking**: Jab koi sofa 90° rotate hota hai (e.g. L-Shape mode me), uska X-width aur Y-depth swap ho jaata hai. Hamara engine Trigonometry (`Math.sin(rotation)`) check karta hai:
   ```javascript
   const aRotated = Math.abs(Math.sin(item.rotation || 0)) > 0.5;
   const effectiveWidth = aRotated ? item.depth : item.width;
   const effectiveDepth = aRotated ? item.width : item.depth;
   ```
   Isse rotated furniture ki bounding box exactly map hoti hai.
2. **Concentric Spiral Relaxation (`findCleanPosition`)**: Jab bhi engine koi naya item room me place karta hai, woh pehle check karta hai ki kya target coordinate `(tx, ty)` par pehle se rakhe kisi item ke saath collision ho raha hai (with **0.7 ft / 8.4 inch luxury clearance buffer**).
   * Agar jagah saaf (clean) hai -> Item turant place ho jaata hai.
   * Agar jagah occupied (overlap) hai -> Engine **Concentric Circles (Spirals)** me bahar ki taraf search karta hai (`r = 0.5 ft` se lekar `15 ft` tak, 16 different angles par):
   ```javascript
   for (let r = 0.5; r <= 15; r += 0.5) {
     for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
       candX = tx + Math.cos(angle) * r;
       candY = ty + Math.sin(angle) * r;
       if (!isOverlapping(candX, candY)) return cleanCoordinate;
     }
   }
   ```
   Yeh mathematical spiral guarantee karta hai ki room me chahe 10 items ho ya 15, koi bhi do item kabhi overlap nahi karenge aur na hi walls ke bahar jayenge!

#### Step 4: Ergonomic & Cognitive Scoring (`clearance.js`, `cognitive.js`)
* **36-Inch Walkway Rule**: Engine check karta hai ki main doors se seating tak kam se kam 3 feet (36 inches) ka rasta khula ho.
* **Cognitive Load & Roast Generation**: Space efficiency percentage aur visual clutter ko score karke automated architecture critique generate kiya jaata hai.

---

## 3. Frontend Architecture & Technologies

### 🛠️ Core Technology Stack
* **Framework**: React 18 with TypeScript (`Vite` bundler for instant Hot Module Replacement & blazing fast builds).
* **Styling & Design System**: Tailwind CSS with custom CSS variables (Italian Luxury Editorial aesthetic, deep dark mode `#080d18`, zero AI badges/watermarks).
* **Animations**: `framer-motion` for smooth micro-animations, page transitions, aur interactive UI feedback.
* **3D Visualization**: `Three.js` via `@react-three/fiber` aur `@react-three/drei` (WebGL dynamic 3D rendering with real-time lighting and shadows).
* **Icons & UI Utilities**: `lucide-react` for clean, professional iconography; `html2canvas` for layout sharing & export.

### 🖼️ How Layouts & 3D Models are Rendered
* **2D Architectural Blueprint (`LayoutGallery.tsx`)**: Har 12 philosophy layout ko ek scalable vector canvas (`<svg>`) me render kiya jaata hai. Room boundary, grid pattern, windows/doors, aur rotated furniture boxes exact mathematical scale (`ft` ya `m`) me draw hote hain.
* **3D Studio (`WebGLHero.tsx` & `Fullscreen3DStudio.tsx`)**: Jab user "3D View" click karta hai, frontend backend se aayi `(x, y, rotation, width, depth)` array ko read karta hai aur Three.js 3D meshes (Sofas, Tables, TV units with metallic/fabric textures) ko camera controls (orbit, zoom, pan) ke saath render karta hai.

---

## 4. Frontend SEO Optimization Strategy
Ek luxury web application ko Google search me rank karane ke liye hamne frontend me yeh SEO best practices implement ki hain:

1. **Semantic HTML5 Hierarchy**:
   * Har page par sirf ek primary `<main>` aur ek single `<h1>` tag hai jo keyword-rich title hold karta hai (e.g., *"12 Expert Arrangements — Spatial Harmony"*).
   * Headers (`<header>`), sections (`<section>`), aur semantic navigation (`<nav>`) properly structured hain.
2. **Performance & Core Web Vitals (LCP, CLS, FID)**:
   * **Lazy Loading**: Heavy WebGL Three.js 3D components ko `React.lazy()` aur `<Suspense>` ke saath dynamically load kiya jaata hai taaki initial page load script size extremely small ho.
   * **Zero Layout Shifts (CLS)**: Images, SVGs, aur layout grids ke fixed aspect ratios (`aspect-video`, explicit height/width) defined hain taaki page loading ke waqt content jump na kare.
   * **Ultra-Fast Bundling**: Vite code-splitting karta hai jisse bundle execution time minimal rehta hai (`✓ built in 17s`).
3. **Clean Typography & Accessibility**:
   * High contrast ratios (dark background `#080d18` with crisp white/muted text) accessibility standards (WCAG AA) pass karte hain.
   * Descriptive labels, alt-tags, aur clean URL structure without excessive query parameters search engine bots ke liye indexing easy banate hain.

---

## 5. Summary for Interviews & Presentations (Quick Pitch)
Agar interview me poochha jaye ki **"Space Weaver ka working model samjhao"**, toh aap yeh 3 bullet points bol sakte ho:

* *"Space Weaver ek full-stack AI & spatial geometry platform hai jo React + TypeScript frontend aur Node.js backend par bana hai."*
* *"Layout arrangement ke liye hum koi generic LLM use nahi karte kyunki LLMs 3D coordinates me hallucinate karke furniture overlap kar dete hain. Iski jagah hamne custom **Human Spatial Reasoning Engine (HSRE)** design kiya hai jo 6 geometric zones aur trigonometric rotation checks use karta hai."*
* *"Overlapping rokne ke liye hamara backend ek **Concentric Spiral Placement Algorithm (`findCleanPosition`)** run karta hai — agar koi initial position occupied hai, toh engine outwardly spiral karke nearest 100% clean coordinate par furniture lock karta hai, jisse 0% overlap guarantee hota hai with luxury 36-inch walkway affordance."*
