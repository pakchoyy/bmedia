import Link from "next/link";
import type { MediaCategory } from "@/types/media";
import Icon from "./Icon";

interface CategoryCardProps {
  category: {
    name: MediaCategory;
    icon: string;
    color: string;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/catalog?kategori=${encodeURIComponent(category.name)}`}
      className="bg-white dark:bg-slate-900 p-8 rounded-xl text-center shadow-sm hover:-translate-y-1.5 hover:shadow-md hover:border-primary-light transition-all duration-300 cursor-pointer border border-gray-100 dark:border-slate-800"
    >
      <Icon name={category.icon} className="text-4xl mb-4 mx-auto" style={{ color: category.color }} />
      <h3 className="text-lg font-semibold text-ink dark:text-slate-100">{category.name}</h3>
    </Link>
  );
}
