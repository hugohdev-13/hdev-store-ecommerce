(async () => {
  const canvas = document.getElementById('salesChart');
  const status = document.getElementById('salesStatus');
  if (!canvas || !status) return;

  try {
    if (typeof Chart === 'undefined') {
      throw new Error('No fue posible cargar Chart.js. Revisa tu conexión y recarga la página.');
    }
    const response = await fetch(canvas.dataset.url);
    if (!response.ok) throw new Error('No fue posible obtener los datos de ventas.');
    const data = await response.json();
    if (
      !Array.isArray(data.labels) ||
      !Array.isArray(data.sales) ||
      data.labels.length === 0 ||
      data.labels.length !== data.sales.length ||
      !data.labels.every((label) => typeof label === 'string') ||
      !data.sales.every((value) => Number.isFinite(value) && value >= 0)
    ) {
      throw new Error('Los datos de ventas tienen un formato inválido.');
    }
    const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{ label: 'Ventas (MXN)', data: data.sales, backgroundColor: '#2858cf' }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: {
          tooltip: { callbacks: { label: (context) => money.format(context.parsed.y) } },
        },
      },
    });
    status.textContent = data.labels
      .map((label, index) => `${label}: ${money.format(data.sales[index])} MXN`)
      .join(' · ');
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'No se pudo cargar la gráfica.';
    status.setAttribute('role', 'alert');
  }
})();
