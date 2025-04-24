// Generate random dashboard data for farmers
exports.getFarmerDashboard = async (req, res) => {
  try {
    // Get the farmer ID from request
    const farmerId = req.userId;

    // Generate dummy statistics
    const stats = {
      totalProducts: Math.floor(Math.random() * 20) + 5,
      totalOrders: Math.floor(Math.random() * 50) + 20,
      pendingOrders: Math.floor(Math.random() * 10),
      totalEarnings: Math.floor(Math.random() * 30000) + 10000,
      monthlySales: Math.floor(Math.random() * 8000) + 2000,
    };

    // Generate dummy recent orders
    const productImages = [
      "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2",
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655",
      "https://images.unsplash.com/photo-1508747703725-719777637510",
      "https://images.unsplash.com/photo-1544616326-38a74c8f87c8",
      "https://images.unsplash.com/photo-1550583724-b2692b85b150",
    ];

    const productNames = [
      "Organic Tomatoes",
      "Fresh Potatoes",
      "Red Onions",
      "Crisp Apples",
      "Farm Fresh Milk",
    ];

    const statuses = ["pending", "processing", "shipped", "delivered"];
    const customerNames = [
      "Rahul Sharma",
      "Priya Patel",
      "Amit Kumar",
      "Sneha Gupta",
      "Vikram Singh",
    ];

    // Generate recent orders
    const recentOrders = [];
    for (let i = 0; i < 5; i++) {
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let orderTotal = 0;

      for (let j = 0; j < numItems; j++) {
        const productIndex = Math.floor(Math.random() * 5);
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = Math.floor(Math.random() * 100) + 20;
        const itemTotal = price * quantity;
        orderTotal += itemTotal;

        items.push({
          product: {
            _id: `p${i}${j}`,
            name: productNames[productIndex],
            image: productImages[productIndex],
            price: price,
            unit: ["kg", "gm", "piece"][Math.floor(Math.random() * 3)],
          },
          quantity: quantity,
          price: price,
        });
      }

      // Calculate date (within the last month)
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      recentOrders.push({
        _id: `ord${100000 + i}`,
        items: items,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        farmerSubtotal: orderTotal,
        createdAt: date.toISOString(),
        user: {
          username:
            customerNames[Math.floor(Math.random() * customerNames.length)],
        },
      });
    }

    // Generate monthly earnings for the last 6 months
    const monthlyEarnings = [];
    const currentMonth = new Date().getMonth();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 5; i >= 0; i--) {
      let monthIndex = currentMonth - i;
      let yearOffset = 0;

      if (monthIndex < 0) {
        monthIndex += 12;
        yearOffset = -1;
      }

      const year = new Date().getFullYear() + yearOffset;
      const month = monthNames[monthIndex];

      // Simulate growing trend with some randomness
      const baseAmount = 4000 + (5 - i) * 1000; // Increasing trend
      const randomVariation = Math.floor(Math.random() * 2000) - 1000; // +/- 1000
      const earnings = Math.max(500, baseAmount + randomVariation);

      monthlyEarnings.push({
        month: `${month} ${year}`,
        earnings: earnings,
      });
    }

    // Generate product categories
    const categories = ["Vegetables", "Fruits", "Dairy", "Grains", "Herbs"];
    const productCategories = categories.map((category) => ({
      name: category,
      count: Math.floor(Math.random() * 10) + 1,
      color: getRandomColor(category),
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));

    // Generate popular products
    const popularProducts = [];
    for (let i = 0; i < 5; i++) {
      const productIndex = Math.floor(Math.random() * 5);
      const totalQuantity = Math.floor(Math.random() * 50) + 10;
      const unitPrice = Math.floor(Math.random() * 100) + 20;

      popularProducts.push({
        product: {
          _id: `p${i}`,
          name: productNames[productIndex],
          image: productImages[productIndex],
          price: unitPrice,
          unit: ["kg", "gm", "piece"][Math.floor(Math.random() * 3)],
        },
        totalQuantity: totalQuantity,
        totalRevenue: totalQuantity * unitPrice,
      });
    }

    // Return the complete dashboard data
    res.status(200).json({
      success: true,
      dashboardData: {
        stats,
        recentOrders,
        popularProducts,
        monthlyEarnings,
        productCategories,
      },
    });
  } catch (error) {
    console.error("Error generating dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate dashboard data",
      error: error.message,
    });
  }
};

// Helper function to generate random colors for pie chart
function getRandomColor(seed) {
  // Use a simple hash of the seed string to generate consistent colors
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#8AC249",
    "#EA5545",
    "#F46A9B",
    "#EF9B20",
    "#EDBF33",
    "#87BC45",
    "#27AEEF",
    "#B33DC6",
  ];

  // Use the hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
