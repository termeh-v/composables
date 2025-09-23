<script setup lang="ts">
import { ref, watch } from "vue";
import { useFilter, type Filters } from "../../src";

// Example data for demonstration
const defaultFilters: Partial<Filters> = {
    page: 1,
    limit: 10,
    search: "",
    sorts: [{ field: "price", order: "asc" }],
    filters: {
        category: ["books", "ebooks"],
        price: { min: 100, max: 500 },
        available: true,
    },
};

const {
    page,
    limit,
    search,
    sorts,
    filters,
    isFiltered,
    apply,
    onApply,
    parseURL,
    parseResponse,
} = useFilter<any, any>("demo-filters", { defaults: defaultFilters });
// Test parseURL
function testParseURL() {
    // Simulate a query string for filters
    const query =
        "page=3&limit=5&search=foo&sorts=price:desc,id:asc&category=books,ebooks&available=true";
    console.log("Testing parseURL with:", query);
    parseURL(query);
    // The onApply callback and watcher will log the result
}

// Test parseResponse
function testParseResponse() {
    // Simulate a response object
    const response = {
        page: 4,
        limit: 15,
        search: "bar",
        sorts: [{ field: "id", order: "desc" }],
        filters: {
            price: { min: 10, max: 99 },
            available: false,
        },
    };
    console.log("Testing parseResponse with:", response);
    parseResponse(response);
    // The onApply callback and watcher will log the result
}

const newSearch = ref("");
const newLimit = ref(10);
const newSortField = ref("price");
const newSortOrder = ref<"asc" | "desc">("asc");

// Log all filter state changes
onApply((params, urlEncoded) => {
    console.log("onApply callback:", params, urlEncoded);
});

// Watchers for demonstration
watch([page, limit, search, sorts, filters], ([p, l, s, so, f]) => {
    console.log("Filter state changed:", {
        page: p,
        limit: l,
        search: s,
        sorts: so,
        filters: f,
    });
});

function updateFilters() {
    apply({
        search: newSearch.value,
        limit: Number(newLimit.value),
        sorts: [{ field: newSortField.value, order: newSortOrder.value }],
    });
}

function resetFilters() {
    apply(defaultFilters);
}
</script>

<template>
    <div>
        <h2>useFilter Demo</h2>
        <div style="margin-bottom: 1em">
            <label>
                Search:
                <input v-model="newSearch" placeholder="Search..." />
            </label>
            <label style="margin-left: 1em">
                Limit:
                <input
                    type="number"
                    v-model="newLimit"
                    min="1"
                    style="width: 4em"
                />
            </label>
            <label style="margin-left: 1em">
                Sort by:
                <select v-model="newSortField">
                    <option value="price">Price</option>
                    <option value="id">ID</option>
                </select>
                <select v-model="newSortOrder">
                    <option value="asc">asc</option>
                    <option value="desc">desc</option>
                </select>
            </label>
            <button @click="updateFilters" style="margin-left: 1em">
                Apply
            </button>
            <button @click="resetFilters" style="margin-left: 0.5em">
                Reset
            </button>
            <button @click="testParseURL" style="margin-left: 1em">
                Test parseURL
            </button>
            <button @click="testParseResponse" style="margin-left: 0.5em">
                Test parseResponse
            </button>
        </div>
        <div>
            <b>Current Filters:</b>
            <pre>{{
                {
                    page,
                    limit,
                    search,
                    sorts,
                    filters,
                    isFiltered,
                }
            }}</pre>
            <small
                >All filter state changes and onApply callback are logged in the
                console.</small
            >
        </div>
    </div>
</template>
