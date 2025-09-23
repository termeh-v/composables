<script setup lang="ts">
import { useSigner } from "../../src";

const signer = useSigner();

const data = {
    page: 2,
    limit: 20,
    sorts: [
        {
            field: "price",
            order: "asc",
        },
        {
            field: "id",
            order: "desc",
        },
    ],
    search: "Test Book",
    filters: {
        category: ["books", "ebooks"],
        price: { min: 100, max: 500 },
        available: true,
        maxAge: 60,
        minAge: 12.2,
    },
};

function run() {
    signer.sign(data).then((sign) => {
        console.log("Sign:", sign);

        data.filters.category = ["ebooks", "books"];
        signer.validate(data, sign).then((ok) => {
            console.log("Validate:", ok);
        });

        signer.validate({ test: 2 }, sign).then((ok) => {
            console.log("No Validate:", ok);
        });
    });
}
</script>

<template>
    <div>
        <h2>useSigner Demo</h2>
        <div>
            <button @click="run">Click and check console</button>
        </div>
    </div>
</template>
