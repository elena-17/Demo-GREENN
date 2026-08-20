import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import LayerCard from "./layer-card";
import { useEffect, useRef } from "react";
import cx from 'clsx';
import classes from "../styles/cnnBuilder.module.css";

const CnnBuilder = ({ layers, onChange, onEditLayer, onDeleteLayer }) => {
    const prevLayers = useRef(layers);

    useEffect(() => {
        if (prevLayers.current !== layers) {
            onChange(layers);
            prevLayers.current = layers;
        }
    }, [layers, onChange]);

    const items = layers.map((layer, index) => (
        <Draggable key={layer.id.toString()} index={index} draggableId={layer.id.toString()}>
            {(provided, snapshot) => (
                <div
                    className={cx(classes.cardWrapper, {
                        [classes.cardDragging]: snapshot.isDragging,
                    })}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <LayerCard layer={layer} onEdit={() => onEditLayer(layer)}
                        onDelete={() => {
                            onDeleteLayer?.(layer);
                        }} />
                </div>
            )}
        </Draggable>
    ));

    return (
        <DragDropContext
            onDragEnd={({ destination, source }) => {
                if (!destination) return;
                const reorderedLayers = Array.from(layers);
                const [movedLayer] = reorderedLayers.splice(source.index, 1);
                reorderedLayers.splice(destination.index, 0, movedLayer);
                onChange(reorderedLayers);
            }}
        >
            <Droppable droppableId="cnn-layers" direction="vertical">
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {items}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default CnnBuilder;
