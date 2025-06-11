'use client';

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartNoAxesCombined, GripVertical, Image, LayoutDashboard, Lock, Plus, Redo, Star, Trash, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

type ItemType = {
    id: string;
    label: string;
    url?: string;
    icon?: string;
};

let counter = 4;

export default function DragSortableList({ data }: { data: Array<ItemType> }) {
    const [items, setItems] = useState<ItemType[]>([...data]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    function handleDragEnd(event: any) {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            setItems((items) => arrayMove(items, oldIndex, newIndex));
        }
    }

    function handleAddItem(value: ItemType) {
        const newItem = {
            id: counter.toString(),
            label: value.label,
            url: value.url,
            icon: value.icon,
        };
        counter++;
        setItems((prev) => [...prev, newItem]);
    }

    function updateItem(id: string, newLabel: string) {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, label: newLabel } : item
            )
        );
    }

    return (
        <div className="space-y-4">
            <Button variant="outline" onClick={() => handleAddItem({ id: '', label: '', url: '', icon: '' })} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Link
            </Button>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {items.map((item) => (
                            <SortableCard key={item.id} item={item} onUpdate={updateItem} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}

function SortableCard({ item, onUpdate }: { item: ItemType; onUpdate: (id: string, label: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Card ref={setNodeRef} style={style} className="p-2 px-4">
            <div className='flex items-center justify-between w-full'>
                <div className='w-[5%] flex items-center'>
                    <Button variant="ghost" {...attributes} {...listeners}>
                        <GripVertical className="w-4 h-4" />
                    </Button>
                </div>
                <div className='w-[95%]'>
                    <div className='flex w-full justify-between items-center gap-2 mb-2'>
                        <CardContent className="p-0 mb-2 w-[90%]">
                            <Input
                                name='label'
                                type="text"
                                value={item.label}
                                onChange={(e) => onUpdate(item.id, e.target.value)}
                                className='w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 mb-2 bg-transparent'
                            />
                            <Input
                                name='description'
                                type="text"
                                value={item.url}
                                onChange={(e) => onUpdate(item.id, e.target.value)}
                                className='w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent'
                            />
                        </CardContent>

                        <div className='flex items-center'>
                            <Switch />
                        </div>
                    </div>

                    <div className='flex items-center justify-between w-full'>
                        <div className='flex items-center justify-strart gap-4'>
                            <LayoutDashboard className="w-4 h-4" />
                            <Image className="w-4 h-4" />
                            <Star className="w-4 h-4" />
                            <Redo className="w-4 h-4"/>
                            <Lock className="w-4 h-4"/>
                            <ChartNoAxesCombined className="w-4 h-4"/>
                        </div>
                        <Button variant="outline" size="icon">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
