import {
  Laptop, BookOpen, Armchair, UtensilsCrossed,
  Lamp, Shirt, Dumbbell, Music,
} from 'lucide-react'

export const categoryGroups = [
  {
    name: 'Tech & Electronics',
    count: 18,
    icon: Laptop,
    items: ['Laptops', 'Phones', 'Headphones', 'Chargers', 'Cameras'],
    color: 'bg-blue-50 text-blue-600',
  },
  {
    name: 'Academic',
    count: 12,
    icon: BookOpen,
    items: ['Engineering Books', 'Novels', 'Notebooks', 'Lab Equipment'],
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    name: 'Furniture',
    count: 10,
    icon: Armchair,
    items: ['Study Tables', 'Chairs', 'Beds', 'Bookshelves'],
    color: 'bg-orange-50 text-orange-600',
  },
  {
    name: 'Kitchen & Appliances',
    count: 12,
    icon: UtensilsCrossed,
    items: ['Induction Cooktops', 'Kettles', 'Cookware', 'Microwaves'],
    color: 'bg-red-50 text-red-600',
  },
  {
    name: 'Room Essentials',
    count: 10,
    icon: Lamp,
    items: ['Bedsheets', 'Curtains', 'Lights', 'Extension Boards'],
    color: 'bg-purple-50 text-purple-600',
  },
  {
    name: 'Fashion & Accessories',
    count: 12,
    icon: Shirt,
    items: ['Clothing', 'Footwear', 'Watches', 'Backpacks'],
    color: 'bg-pink-50 text-pink-600',
  },
  {
    name: 'Sports & Fitness',
    count: 12,
    icon: Dumbbell,
    items: ['Cricket Gear', 'Gym Weights', 'Bicycles', 'Yoga Mats'],
    color: 'bg-teal-50 text-teal-600',
  },
  {
    name: 'Lifestyle & Entertainment',
    count: 10,
    icon: Music,
    items: ['Guitars', 'Board Games', 'Art Supplies', 'Collectibles'],
    color: 'bg-amber-50 text-amber-600',
  },
]
