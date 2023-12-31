import { Reservation } from "../Model/Reservation.js"
import { Spot } from "../Model/Spot.js";
import { ReservationRepo } from "../Repositories/ReservationRepo.js"
import { CarService } from "./CarService.js";
import { ParkService } from "./ParkService.js";

export class ReservationService {
    #carService : CarService;
    #parkService : ParkService;
    #reservationRepo : ReservationRepo;
    constructor() {
        this.#carService = new CarService();
        this.#parkService = new ParkService();
        this.#reservationRepo = new ReservationRepo();
    }
    createReservation(reservation : Reservation) : Reservation | null {
        if (this.isReservationPossible(reservation)) {
            var park = this.#parkService.getParkById(reservation.park_id ?? -1)
            if (park == null) return null;
            var car = this.#carService.getCarById(reservation.car_id ?? -1)
            if (car == null) return null;
            var res = this.#reservationRepo.create(reservation);
            park.changeSpot(res.floor ?? "", res.spot ?? -1, res.state ?? Spot.EMPTY, res.id ?? -1);
            this.#parkService.updatePark(park);
            car.has_reserv = true;
            this.#carService.updateCar(car);
            return res;
        }
        return null;
    }
    updateReservation(reservation : Reservation) : Reservation {
        return this.#reservationRepo.update(reservation);
    }
    deleteReservation(reservation : Reservation) : void {
        this.#reservationRepo.delete(reservation);
    }
    getReservation(reservation : Reservation) : Reservation | null {
        return this.#reservationRepo.findById(reservation.id?? -1);
    }
    getAllReservations() {
        return this.#reservationRepo.findAll();
    }
    getReservationById(id : number) : Reservation | null {
        return this.#reservationRepo.findById(id);
    }
    getAllReservationsByCarId(car_id : number) : Array<Reservation> {
        return this.#reservationRepo.findAllByCarId(car_id);
    }
    getAllReservationsByParkId(park_id : number) : Array<Reservation> {
        return this.#reservationRepo.findAllByParkId(park_id);
    }
    isReservationPossible(reservation : Reservation) : boolean {
        var car = this.#carService.getCarById(reservation.car_id ?? -1)
        if (car == null || car.has_reserv) return false;
        var park = this.#parkService.getParkById(reservation.park_id ?? -1)
        if (park == null) return false;
        return park.isSpotFree(reservation.floor ?? "", reservation.spot ?? -1);
    }
    cancelReservation(reservation : Reservation) : Reservation | null {
        var park = this.#parkService.getParkById(reservation.park_id ?? -1)
        if (park == null) return null;
        var car = this.#carService.getCarById(reservation.car_id ?? -1)
        if (car == null || !car.has_reserv) return null;
        reservation.state = Spot.EXPIRED;
        var res = this.#reservationRepo.update(reservation);
        park.changeSpot(res.floor ?? "", res.spot ?? -1, Spot.FREE, -1);
        this.#parkService.updatePark(park);
        car.has_reserv = false;
        this.#carService.updateCar(car);
        return res;
    }
};