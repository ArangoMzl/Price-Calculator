"use client";
// components/PriceCalculator.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const PriceCalculator: React.FC = () => {
  const [comfreyQuantity, setComfreyQuantity] = useState<number>(0);
  const [teaselQuantity, setTeaselQuantity] = useState<number>(0);
  const [totalPrices, setTotalPrices] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<any[]>([]);
  const [quantityList, setQuantityList] = useState<
    { itemName: string; quantity: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://west.albion-online-data.com/api/v2/stats/prices/T5_TEASEL,T3_COMFREY?locations=Martlock,Lymhurst,FortSterling,Thetford,Bridgewatch"
        );

        // Modificar los nombres según el item_id
        const modifiedPrices = response.data.map((price) => {
          const itemName =
            price.item_id === "T3_COMFREY"
              ? "Consuelda hojabrillante"
              : price.item_id === "T5_TEASEL"
              ? "Cardo de dragón"
              : price.itemName; // Mantener el nombre original si no coincide con los anteriores

          return {
            ...price,
            itemName,
          };
        });

        setPrices(modifiedPrices);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAddQuantity = () => {
    const totalPricesByCity: Record<string, number> = { ...totalPrices };

    prices.forEach((price) => {
      const quantity =
        price.itemName === "Consuelda hojabrillante"
          ? comfreyQuantity
          : price.itemName === "Cardo de dragón"
          ? teaselQuantity
          : 0;

      const totalPrice = quantity * price.sell_price_min;

      if (!totalPricesByCity[price.city]) {
        totalPricesByCity[price.city] = 0;
      }

      totalPricesByCity[price.city] += totalPrice;
    });

    setTotalPrices(totalPricesByCity);

    // Agregar la cantidad a la lista
    const updatedList = [...quantityList];
    const existingIndex = updatedList.findIndex(
      (item) => item.itemName === "Consuelda hojabrillante"
    );
    if (existingIndex !== -1) {
      updatedList[existingIndex].quantity += comfreyQuantity;
    } else {
      updatedList.push({
        itemName: "Consuelda hojabrillante",
        quantity: comfreyQuantity,
      });
    }

    const existingTeaselIndex = updatedList.findIndex(
      (item) => item.itemName === "Cardo de dragón"
    );
    if (existingTeaselIndex !== -1) {
      updatedList[existingTeaselIndex].quantity += teaselQuantity;
    } else {
      updatedList.push({
        itemName: "Cardo de dragón",
        quantity: teaselQuantity,
      });
    }

    setQuantityList(updatedList);

    // Limpiar los inputs
    setComfreyQuantity(0);
    setTeaselQuantity(0);
  };

  const handleReset = () => {
    setComfreyQuantity(0);
    setTeaselQuantity(0);
    setTotalPrices({});
    setQuantityList([]);
  };

  return (
    <div className="bg-[#4a4857]/50 py-2 my-[15vh] md:my-[13vh] backdrop-blur-sm">
      <h1 className="text-[#86c28b] font-bold mb-4">Price Calculator</h1>
      <div>
        <Label>
          Cantidad de Consuelda hojabrillante:
          <Input
            type="text"
            className="flex justify-center text-center w-96 m-auto"
            value={comfreyQuantity}
            onChange={(e) => setComfreyQuantity(Number(e.target.value))}
          />
        </Label>
      </div>
      <div>
        <Label>
          Cantidad de Cardo de dragón:
          <Input
            type="text"
            className="flex justify-center text-center w-96 m-auto"
            value={teaselQuantity}
            onChange={(e) => setTeaselQuantity(Number(e.target.value))}
          />
        </Label>
      </div>
      <div className="my-8 gap-2 flex flex-row justify-center">
        <Button onClick={handleAddQuantity}>Agregar Cantidades</Button>
        <Button onClick={handleReset}>Resetear</Button>
      </div>
      <div>
        <h2 className="text-[#77b885] font-bold">Lista de Cantidades:</h2>
        <ul>
          {quantityList.map((item, index) => (
            <li key={index}>
              {item.itemName}: {item.quantity}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8">
        <h2 className="text-[#77b885] font-bold">Total Prices:</h2>
        {Object.entries(totalPrices).map(([city, totalPrice]) => (
          <div
            key={city}
            style={{
              backgroundColor:
                totalPrice === Math.max(...Object.values(totalPrices))
                  ? "lightgreen"
                  : "lightcoral",
            }}
            className="text-center w-96 m-auto rounded-lg my-2"
          >
            {city}: $ {totalPrice}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceCalculator;
