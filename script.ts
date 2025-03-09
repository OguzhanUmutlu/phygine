import World from "./src/World";
import Renderer from "./src/render/Renderer";
import PanController from "./src/controller/PanController";
import ZoomController from "./src/controller/ZoomController";
import PullConstraintController from "./src/controller/PullConstraintController";
import Circle from "./src/shape/Circle";
import Box from "./src/shape/Box";
import Vector from "./src/utils/Vector";

const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;
const world = new World()
    .startInterval();

const renderer = new Renderer(world, ctx)
    .addController(PanController, ZoomController, PullConstraintController)
    .noContextMenu()
    .autoResize()
    .startFrameLoop();

world.createRigidBody(new Circle(20));

world.createRigidBody(new Box(100, 20), {isStatic: true, position: new Vector(-50.5, -40)});

world.createRigidBody(new Box(800, 20), {isStatic: true, position: new Vector(0, -300)});
world.createRigidBody(new Box(800, 20), {isStatic: true, position: new Vector(0, 300)});
world.createRigidBody(new Box(20, 620), {isStatic: true, position: new Vector(400, 0)});
world.createRigidBody(new Box(20, 620), {isStatic: true, position: new Vector(-400, 0)});

world.createRigidBody(new Box(100, 20), {isStatic: true, position: new Vector(100, -200)});
world.createRigidBody(new Box(100, 20), {isStatic: true, position: new Vector(130, -100)});