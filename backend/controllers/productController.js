/**
 * Product Catalog Controller
 */
export const productController = {
  async getAllProducts(req, res) {
    return res.json({
      success: true,
      products: [
        { id: "tee-heavyweight", name: "Heavyweight Boxy Tee", price: 34.99, category: "T-Shirts" },
        { id: "hoodie-vintage", name: "Vintage Wash Hoodie", price: 54.99, category: "Hoodies" },
        { id: "polo-minimal", name: "Minimalist Pique Polo", price: 39.99, category: "Polos" },
      ],
    });
  },

  async createProduct(req, res) {
    const newProd = { id: `prod-${Date.now()}`, ...req.body };
    return res.status(201).json({ success: true, product: newProd });
  },

  async updateProduct(req, res) {
    const { id } = req.params;
    return res.json({ success: true, product: { id, ...req.body } });
  },

  async deleteProduct(req, res) {
    const { id } = req.params;
    return res.json({ success: true, message: `Product ${id} deleted.` });
  },
};
