const students = [
  { name: 'Bima Arjuna', activity: 'Basket', achievement: 'MVP DBL 2024', img: '' },
  { name: 'Putri Lestari', activity: 'Tari Tradisional', achievement: 'Juara 1 Tari Nusantara 2024', img: '' },
  { name: 'Agung Wijaya', activity: 'Taekwondo', achievement: 'Medali Perunggu SEA Student 2024', img: '' },
  { name: 'Maya Indira', activity: 'Voly', achievement: 'Tim Terbaik Voli Pelajar 2024', img: '' },
];

const grid = document.getElementById('studentGrid');

students.forEach((s) => {
  const card = document.createElement('div');
  card.className = 'bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition';
  card.innerHTML = `
        <img src="${s.img}" alt="${s.activity}" class="h-56 w-full object-cover" />
        <div class="p-4">
          <h2 class="text-lg font-semibold text-gray-800">${s.name}</h2>
          <p class="text-sm text-gray-600">${s.activity}</p>
          <p class="text-xs text-blue-600 mt-2 font-medium">${s.achievement}</p>
        </div>
      `;
  grid.appendChild(card);
});
