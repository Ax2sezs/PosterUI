import { Plus } from "lucide-react";

export default function MenuCard({ name, price, image }) {
  return (
    <div className="">
      <figure>
        <img src={image} alt={name} className="h-40 w-full object-cover" />
      </figure>
      <div className="">
        <h2 className="card-title text-base">{name}</h2>
        <p className="text-sm text-gray-500">{price} บาท</p>
        <div className="card-actions justify-end">
          <button className="btn btn-sm btn-primary">
            <Plus size={16} />
            เพิ่ม
          </button>
        </div>
      </div>
    </div>
  );
}
