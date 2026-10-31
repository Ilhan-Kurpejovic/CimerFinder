from __future__ import annotations

import logging

from app.auth.password import hash_password
from app.auth.repositories.auth import IAuthRepository
from app.auth.schemas.auth import CurrentUser
from app.database.session_handler import db_session_handler
from app.listings.schemas.listing import ListingCreateRequestSchema, ListingFilters
from app.listings.services.listing import IListingService
from app.users.models.user import User
from app.utils.di import get_from_di_container
from app.utils.pagination import PaginationParams

logger = logging.getLogger(__name__)


@db_session_handler
def seed() -> None:
    repository = get_from_di_container(IAuthRepository)
    user = repository.get_user_by_email("demo@example.com")
    if user is None:
        user = repository.add_user(
            User(
                email="demo@example.com",
                password_hash=hash_password("demo1234"),
                display_name="Demo korisnik",
                age=24,
                occupation="Student",
                city="Beograd",
            )
        )
    current = CurrentUser.model_validate(user)
    if current.age is None or len(current.occupation.strip()) < 2:
        logger.info("Demo profile is incomplete; existing data was preserved")
        return
    service = get_from_di_container(IListingService)
    samples = [
        {
            "title": "Tvoj mirni kutak na Vračaru",
            "city": "Beograd",
            "neighborhood": "Vračar",
            "price": 280,
            "kind": "room",
            "imageUrl": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
        },
        {
            "title": "Svijetla soba, dobra energija",
            "city": "Novi Sad",
            "neighborhood": "Grbavica",
            "price": 220,
            "kind": "room",
            "imageUrl": "https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1000&q=85",
        },
        {
            "title": "Tražim dom i dobrog cimera",
            "city": "Beograd",
            "neighborhood": "Centar",
            "price": 300,
            "kind": "roommate",
            "imageUrl": None,
        },
    ]
    for sample in samples:
        title = str(sample["title"])
        existing = service.list(
            ListingFilters(search=title), PaginationParams(page=1, size=500), owner_id=user.id
        )
        if any(item.title == title for item in existing.items):
            continue
        data = ListingCreateRequestSchema.model_validate(
            {
                **sample,
                "description": "Primjer oglasa za prijatan zajednički dom. Uredan prostor, dobra povezanost sa gradom i opušten dogovor o svakodnevnim navikama. Fotografije su ilustrativne.",
                "area": 18,
                "roommates": 1,
                "tags": ["Namješteno", "Wi-Fi", "Pet friendly"],
            }
        )
        service.create(data, current)
    logger.info(
        "Local demo account and sample listings are ready; existing records were not overwritten"
    )
