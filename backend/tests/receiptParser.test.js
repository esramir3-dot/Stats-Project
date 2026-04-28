const {
  normalizeCandidate,
  parseReceiptText
} = require("../src/services/receiptParser");

describe("receipt parser", () => {
  test("strips receipt noise and extracts likely grocery items", () => {
    const receipt = `
      CAMPUS MARKET
      04/28/2026 10:33 AM
      ORG BANANAS 4011      $1.24
      2 X BLACK BEANS CAN   2.18
      GREEK YOGURT 32OZ     5.49
      SUBTOTAL              8.91
      TAX                   0.46
      VISA **** 1234
      TOTAL                 $9.37
      THANK YOU
    `;

    expect(parseReceiptText(receipt)).toEqual([
      "banana",
      "black beans",
      "greek yogurt"
    ]);
  });

  test("handles csv-style receipt exports", () => {
    const receipt = [
      "Item,Qty,Price",
      "Rice,1,4.99",
      "Frozen Vegetables,2,3.49",
      "Soy Sauce,1,2.99"
    ].join("\n");

    expect(parseReceiptText(receipt)).toEqual([
      "rice",
      "frozen vegetables",
      "soy sauce"
    ]);
  });

  test("normalizes a noisy candidate line", () => {
    expect(normalizeCandidate("2 @ LARGE EGGS 12CT $3.99")).toBe("egg");
  });
});
